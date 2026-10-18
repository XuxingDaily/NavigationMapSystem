package zhaolong.dai.nav.vo.routing;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.enums.routing.RouteStrategy;
import zhaolong.dai.nav.enums.routing.TourAlgorithm;
import zhaolong.dai.nav.enums.routing.TravelMode;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "多点游览顺序和分段路线")
public class TourPlanVO {
    @Schema(description = "访问顺序，值为 stops 请求数组中的下标；闭环时起点会在末尾重复")
    private List<Integer> visitOrder;
    private TravelMode travelMode;
    private RouteStrategy strategy;
    private Boolean roundTrip;
    @Schema(description = "本次实际使用的访问顺序算法")
    private TourAlgorithm algorithm;
    @Schema(description = "是否保证得到当前约束下的全局最优访问顺序")
    private Boolean optimal;
    private Double optimizedCost;
    @Schema(description = "optimizedCost 的单位：SECONDS 或 LOCAL_DISTANCE")
    private String optimizedCostUnit;
    private Double totalDistanceLocal;
    private Double totalDurationSeconds;
    private List<RouteLegVO> legs;
    private List<SnappedPointVO> snappedStops;
    private Long networkVersion;
}
