package zhaolong.dai.nav.routing.mapper.model;

import lombok.Data;

@Data
public class SnapRow {
    private Long edgeId;
    private Double fraction;
    private Double snappedX;
    private Double snappedY;
    private Double distanceLocal;
    private Long networkVersion;
}
