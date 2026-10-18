package zhaolong.dai.nav.poi.spatial;

/**
 * 局部坐标范围。
 */
public record PoiSpatialBounds(
        double minX,
        double minY,
        double maxX,
        double maxY
) {

    public PoiSpatialBounds {
        if (!Double.isFinite(minX)
                || !Double.isFinite(minY)
                || !Double.isFinite(maxX)
                || !Double.isFinite(maxY)
                || minX > maxX
                || minY > maxY) {
            throw new IllegalArgumentException("非法 POI 空间范围");
        }
    }

    public static PoiSpatialBounds fromViewport(Double[] viewport) {
        return new PoiSpatialBounds(
                viewport[0],
                viewport[1],
                viewport[2],
                viewport[3]
        );
    }

    public static PoiSpatialBounds around(
            double x,
            double y,
            double radius
    ) {
        return new PoiSpatialBounds(
                x - radius,
                y - radius,
                x + radius,
                y + radius
        );
    }
}
