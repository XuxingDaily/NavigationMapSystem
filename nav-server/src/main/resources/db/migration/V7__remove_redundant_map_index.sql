-- geom_local 已经 NOT NULL；这个旧的 partial GIST 与 idx_map_feature_geom_local 等价。
DROP INDEX IF EXISTS public.idx_map_feature_layer_geom;
