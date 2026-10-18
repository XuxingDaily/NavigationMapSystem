CREATE TABLE public.dataset_revision (
    dataset_code VARCHAR(50) PRIMARY KEY,
    revision     BIGINT NOT NULL DEFAULT 1 CHECK (revision >= 1),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.dataset_revision (dataset_code, revision)
VALUES
    ('poi', 1),
    ('road_network', 1),
    ('map', 1);

CREATE OR REPLACE FUNCTION public.bump_dataset_revision(
    p_dataset_code VARCHAR
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    next_revision BIGINT;
BEGIN
    UPDATE public.dataset_revision
    SET revision = revision + 1,
        updated_at = now()
    WHERE dataset_code = p_dataset_code
    RETURNING revision INTO next_revision;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Dataset revision is not initialized: %',
            p_dataset_code;
    END IF;

    RETURN next_revision;
END;
$$;

COMMENT ON TABLE public.dataset_revision IS
    '各逻辑数据集的当前版本；用于切换 Redis 缓存命名空间';
COMMENT ON COLUMN public.dataset_revision.revision IS
    '数据集每次逻辑写入或批量导入后递增一次';
COMMENT ON FUNCTION public.bump_dataset_revision(VARCHAR) IS
    '必须与对应数据修改放在同一个事务中调用';
