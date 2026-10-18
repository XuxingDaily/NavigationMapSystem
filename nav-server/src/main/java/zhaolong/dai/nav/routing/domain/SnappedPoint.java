package zhaolong.dai.nav.routing.domain;

public record SnappedPoint(
        long edgeId,
        double fraction,
        double x,
        double y,
        double distanceLocal,
        long networkVersion
) {
}
