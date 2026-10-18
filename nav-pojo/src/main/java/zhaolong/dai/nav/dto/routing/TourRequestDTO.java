package zhaolong.dai.nav.dto.routing;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.enums.routing.RouteStrategy;
import zhaolong.dai.nav.enums.routing.TourAlgorithm;
import zhaolong.dai.nav.enums.routing.TravelMode;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "多点游览顺序优化请求。先计算真实路网成本矩阵，再选择精确或启发式算法优化访问顺序")
public class TourRequestDTO {

    @Valid
    @NotNull(message = MessageConstants.TOUR_STOPS_REQUIRED)
    @Size(min = 2, max = 50, message = MessageConstants.TOUR_STOP_COUNT_INVALID)
    @Schema(
            description = "待访问路径点，数量为 2～50。数组下标从 0 开始，fixedStartIndex、fixedEndIndex 和响应 visitOrder 都引用这里的下标",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private List<WaypointDTO> stops;

    @Schema(
            description = "访问顺序算法。AUTO：不超过 12 个点使用 Held-Karp，否则使用 NN + 2-opt；HELD_KARP：精确解且最多 12 点；NN_TWO_OPT：近似解",
            example = "AUTO",
            defaultValue = "AUTO",
            allowableValues = {"AUTO", "HELD_KARP", "NN_TWO_OPT"}
    )
    @Builder.Default
    private TourAlgorithm algorithm = TourAlgorithm.AUTO;

    @Schema(
            description = "出行方式，决定道路通行权限和成本字段",
            example = "WALKING",
            defaultValue = "WALKING",
            allowableValues = {"WALKING", "DRIVING"}
    )
    @Builder.Default
    private TravelMode travelMode = TravelMode.WALKING;

    @Schema(
            description = "优化目标。FASTEST 的 optimizedCost 单位为秒；SHORTEST 的 optimizedCost 单位为局部距离",
            example = "FASTEST",
            defaultValue = "FASTEST",
            allowableValues = {"FASTEST", "SHORTEST"}
    )
    @Builder.Default
    private RouteStrategy strategy = RouteStrategy.FASTEST;

    @Schema(
            description = "是否形成闭环。true 表示游览完所有点后回到固定起点；闭环时不能再指定 fixedEndIndex",
            example = "true",
            defaultValue = "true"
    )
    @Builder.Default
    private Boolean roundTrip = true;

    @Schema(
            description = "固定起点在 stops 数组中的下标，从 0 开始",
            example = "0",
            defaultValue = "0"
    )
    @PositiveOrZero
    @Builder.Default
    private Integer fixedStartIndex = 0;

    @Schema(
            description = "固定终点在 stops 数组中的下标。仅用于 roundTrip=false；为空表示由算法自由选择终点",
            example = "2",
            nullable = true
    )
    @PositiveOrZero
    private Integer fixedEndIndex;

    @Schema(
            description = "每个路径点允许的最大道路吸附距离，单位为局部坐标单位；任一点吸附失败则整个规划失败",
            example = "100.0",
            defaultValue = "100.0"
    )
    @Positive(message = MessageConstants.SNAP_DISTANCE_INVALID)
    @Builder.Default
    private Double maxSnapDistanceLocal = 100.0;
}
