package zhaolong.dai.nav.poi.spatial;

import zhaolong.dai.nav.poi.mapper.model.PoiRow;

/**
 * Redis 空间网格中保存的最小 POI 数据。
 */
public record PoiCacheItem(
        Long id,
        String name,
        String context,
        double x,
        double y,
        Long dataVersion
) {

    public static PoiCacheItem from(PoiRow row) {
        return new PoiCacheItem(
                row.getId(),
                row.getName(),
                row.getContext(),
                row.getX(),
                row.getY(),
                row.getDataVersion()
        );
    }
}
