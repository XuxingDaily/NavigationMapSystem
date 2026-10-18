package zhaolong.dai.nav.vo.routing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteLegVO {
    private Integer fromStopIndex;
    private Integer toStopIndex;
    private Double distanceLocal;
    private Double durationSeconds;
    private String geometryWkt;
}
