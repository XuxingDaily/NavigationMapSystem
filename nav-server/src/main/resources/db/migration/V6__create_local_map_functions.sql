CREATE OR REPLACE FUNCTION public.local_tile_envelope(
    p_z INTEGER,
    p_x INTEGER,
    p_y INTEGER
)
RETURNS geometry(Polygon, 0)
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
DECLARE
    tile_count BIGINT;
    tile_size  DOUBLE PRECISION;
    min_x DOUBLE PRECISION;
    min_y DOUBLE PRECISION;
    max_x DOUBLE PRECISION;
    max_y DOUBLE PRECISION;
BEGIN
    IF p_z < 0 OR p_z > 22 THEN
        RAISE EXCEPTION 'Invalid local tile zoom: %', p_z;
    END IF;

    tile_count := 1::BIGINT << p_z;

    IF p_x < 0 OR p_x >= tile_count
       OR p_y < 0 OR p_y >= tile_count THEN
        RAISE EXCEPTION
            'Invalid local tile coordinate: z=%, x=%, y=%',
            p_z, p_x, p_y;
    END IF;

    tile_size := 8192.0 / tile_count;
    min_x := 46000.0 + p_x * tile_size;
    max_x := 46000.0 + (p_x + 1) * tile_size;
    max_y := 24000.0 - p_y * tile_size;
    min_y := 24000.0 - (p_y + 1) * tile_size;

    RETURN ST_MakeEnvelope(min_x, min_y, max_x, max_y, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_local_vector_tile(
    p_layer_code VARCHAR,
    p_z          INTEGER,
    p_x          INTEGER,
    p_y          INTEGER
)
RETURNS BYTEA
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
AS $$
DECLARE
    v_tile BYTEA;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.map_layer
        WHERE code = p_layer_code
          AND enabled = true
    ) THEN
        RAISE EXCEPTION
            'Map layer does not exist or is disabled: %',
            p_layer_code;
    END IF;

    WITH tile_bounds AS (
        SELECT
            public.local_tile_envelope(p_z, p_x, p_y) AS geom,
            8192.0 / power(2, p_z) AS tile_size
    ),
    candidate_feature AS (
        SELECT
            f.id,
            f.source_feature_id,
            f.name,
            f.properties,
            ST_AsMVTGeom(f.geom_local, b.geom, 4096, 64, true) AS geom
        FROM public.map_feature f
        JOIN public.map_layer l ON l.id = f.layer_id
        CROSS JOIN tile_bounds b
        WHERE l.code = p_layer_code
          AND l.enabled = true
          AND p_z BETWEEN l.min_zoom AND l.max_zoom
          AND f.geom_local && ST_Expand(
              b.geom,
              b.tile_size * 64.0 / 4096.0
          )
    ),
    tile_feature AS (
        SELECT *
        FROM candidate_feature
        WHERE geom IS NOT NULL
          AND NOT ST_IsEmpty(geom)
    )
    SELECT ST_AsMVT(tile_feature, p_layer_code, 4096, 'geom')
    INTO v_tile
    FROM tile_feature;

    RETURN COALESCE(v_tile, ''::BYTEA);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_local_road_vector_tile(
    p_z INTEGER,
    p_x INTEGER,
    p_y INTEGER
)
RETURNS BYTEA
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
    WITH tile_bounds AS (
        SELECT
            public.local_tile_envelope(p_z, p_x, p_y) AS geom,
            8192.0 / power(2, p_z) AS tile_size
    ),
    tile_feature AS (
        SELECT
            e.id,
            e.name,
            e.road_type,
            ST_AsMVTGeom(e.geom_local, b.geom, 4096, 64, true) AS geom
        FROM public.road_edge e
        CROSS JOIN tile_bounds b
        WHERE e.status = 'active'
          AND e.geom_local && ST_Expand(
              b.geom,
              b.tile_size * 64.0 / 4096.0
          )
    ),
    valid_feature AS (
        SELECT *
        FROM tile_feature
        WHERE geom IS NOT NULL
          AND NOT ST_IsEmpty(geom)
    )
    SELECT COALESCE(
        ST_AsMVT(valid_feature, 'road', 4096, 'geom'),
        ''::BYTEA
    )
    FROM valid_feature;
$$;

CREATE OR REPLACE FUNCTION public.get_local_base_vector_tile(
    p_z INTEGER,
    p_x INTEGER,
    p_y INTEGER
)
RETURNS BYTEA
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
    WITH configured_layer(code, draw_order) AS (
        VALUES
            ('boundary'::VARCHAR, 10),
            ('park'::VARCHAR, 20),
            ('water'::VARCHAR, 30),
            ('water_detail'::VARCHAR, 40),
            ('residential'::VARCHAR, 50),
            ('study_area'::VARCHAR, 60),
            ('highway'::VARCHAR, 70)
    ),
    layer_tile AS (
        SELECT
            c.draw_order,
            public.get_local_vector_tile(c.code, p_z, p_x, p_y) AS tile
        FROM configured_layer c
        JOIN public.map_layer l
          ON l.code = c.code
         AND l.enabled = true

        UNION ALL

        SELECT
            80 AS draw_order,
            public.get_local_road_vector_tile(p_z, p_x, p_y) AS tile
    )
    SELECT COALESCE(
        string_agg(tile, ''::BYTEA ORDER BY draw_order)
            FILTER (WHERE octet_length(tile) > 0),
        ''::BYTEA
    )
    FROM layer_tile;
$$;

CREATE OR REPLACE FUNCTION public.import_local_geojson(
    p_file_path TEXT,
    p_layer_code VARCHAR,
    p_replace BOOLEAN DEFAULT true
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_document       JSONB;
    v_layer_id       BIGINT;
    v_imported_count BIGINT;
BEGIN
    SELECT id
    INTO v_layer_id
    FROM public.map_layer
    WHERE code = p_layer_code
    FOR UPDATE;

    IF v_layer_id IS NULL THEN
        RAISE EXCEPTION 'Map layer does not exist: %', p_layer_code;
    END IF;

    v_document := pg_read_file(p_file_path)::JSONB;

    IF v_document ->> 'type' <> 'FeatureCollection' THEN
        RAISE EXCEPTION
            'File is not a GeoJSON FeatureCollection: %',
            p_file_path;
    END IF;

    IF jsonb_typeof(v_document -> 'features') <> 'array' THEN
        RAISE EXCEPTION
            'GeoJSON features is not an array: %',
            p_file_path;
    END IF;

    IF p_replace THEN
        DELETE FROM public.map_feature
        WHERE layer_id = v_layer_id;
    END IF;

    WITH raw_feature AS MATERIALIZED (
        SELECT
            feature.item,
            COALESCE(
                feature.item -> 'properties',
                '{}'::JSONB
            ) AS properties,
            ST_GeomFromGeoJSON(
                (feature.item -> 'geometry')::TEXT
            ) AS raw_geom
        FROM jsonb_array_elements(
            v_document -> 'features'
        ) AS feature(item)
        WHERE jsonb_typeof(feature.item -> 'geometry') = 'object'
    ),
    normalized_feature AS MATERIALIZED (
        SELECT
            item,
            properties,
            ST_SetSRID(
                ST_Force2D(ST_MakeValid(raw_geom)),
                0
            ) AS geom_local
        FROM raw_feature
        WHERE raw_geom IS NOT NULL
    )
    INSERT INTO public.map_feature (
        layer_id,
        source_feature_id,
        name,
        properties,
        geom_local
    )
    SELECT
        v_layer_id,
        COALESCE(
            item ->> 'id',
            properties ->> 'id',
            properties ->> 'Id',
            properties ->> 'ID',
            properties ->> 'fid',
            properties ->> 'FID'
        ),
        COALESCE(
            properties ->> 'name',
            properties ->> 'Name',
            properties ->> 'NAME',
            properties ->> 'text'
        ),
        properties,
        geom_local
    FROM normalized_feature
    WHERE geom_local IS NOT NULL
      AND NOT ST_IsEmpty(geom_local);

    GET DIAGNOSTICS v_imported_count = ROW_COUNT;

    UPDATE public.map_layer
    SET data_version = data_version + 1,
        updated_at = now()
    WHERE id = v_layer_id;

    -- 与数据写入处于同一事务；提交后 MVT 自动切换缓存命名空间。
    PERFORM public.bump_dataset_revision('map');

    RETURN v_imported_count;
END;
$$;
