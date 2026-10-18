-- 旧开发库 baseline 跳过了 V3；补齐新库中已经存在的缩放范围约束。
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.map_layer'::regclass
          AND conname = 'map_layer_zoom_range_ck'
    ) THEN
        ALTER TABLE public.map_layer
            ADD CONSTRAINT map_layer_zoom_range_ck CHECK (
                min_zoom >= 0
                AND max_zoom <= 22
                AND min_zoom <= max_zoom
            );
    END IF;
END;
$$;
