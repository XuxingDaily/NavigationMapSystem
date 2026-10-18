package zhaolong.dai.nav.routing.mapper.model;

import lombok.Data;

@Data
public class RouteRow {
    private Double distanceLocal;
    private Double durationSeconds;
    private String geometryWkt;
    private Long networkVersion;
}
