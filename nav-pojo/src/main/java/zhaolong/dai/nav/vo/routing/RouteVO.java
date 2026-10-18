package zhaolong.dai.nav.vo.routing;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.enums.routing.RouteStrategy;
import zhaolong.dai.nav.enums.routing.TravelMode;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "两点路径规划结果")
public class RouteVO {
    private TravelMode travelMode;
    private RouteStrategy strategy;
    private Double distanceLocal;
    private Double durationSeconds;

    @Schema(description = "局部坐标路线 WKT；当前不能当作 EPSG:4326 GeoJSON")
    private String geometryWkt;

    private SnappedPointVO originSnap;
    private SnappedPointVO destinationSnap;
    private Long networkVersion;
}
