INSERT INTO public.map_layer (
    code,
    name,
    geometry_type,
    source_file,
    min_zoom,
    max_zoom,
    enabled,
    data_version
)
VALUES
    ('boundary',     '区域边界', 'MULTIPOLYGON',    'bound.geojson',       0, 22, true, 1),
    ('highway',      '主要道路', 'MULTILINESTRING', 'highway.geojson',     0, 22, true, 1),
    ('park',         '公园绿地', 'MULTIPOLYGON',    'PARK2.geojson',       0, 22, true, 1),
    ('school',       '学校区域', 'MULTIPOLYGON',    'school_name.geojson', 0, 22, true, 1),
    ('residential',  '生活区',   'MULTIPOLYGON',    'shq.geojson',         0, 22, true, 1),
    ('study_area',   '教学区域', 'MULTIPOLYGON',    'studyArea.geojson',   0, 22, true, 1),
    ('water',        '水系',     'MULTIPOLYGON',    'water.geojson',       0, 22, true, 1),
    ('water_detail', '水系明细', 'MULTIPOLYGON',    'water1.geojson',      0, 22, true, 1);
