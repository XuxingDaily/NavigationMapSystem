package zhaolong.dai.nav.dto.routing;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.enums.routing.RouteStrategy;
import zhaolong.dai.nav.enums.routing.TravelMode;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "两点路径规划请求")
public class RouteRequestDTO {

    @Valid
    @NotNull(message = MessageConstants.ROUTE_ORIGIN_REQUIRED)
    @Schema(description = "路线起点，可使用 POI ID 或局部坐标", requiredMode = Schema.RequiredMode.REQUIRED)
    private WaypointDTO origin;

    @Valid
    @NotNull(message = MessageConstants.ROUTE_DESTINATION_REQUIRED)
    @Schema(description = "路线终点，可使用 POI ID 或局部坐标", requiredMode = Schema.RequiredMode.REQUIRED)
    private WaypointDTO destination;

    @Schema(
            description = "出行方式，决定道路通行权限以及使用哪组道路成本",
            example = "WALKING",
            defaultValue = "WALKING",
            allowableValues = {"WALKING", "DRIVING"}
    )
    @Builder.Default
    private TravelMode travelMode = TravelMode.WALKING;

    @Schema(
            description = "优化目标。FASTEST 按通行秒数寻路；SHORTEST 按道路局部长度寻路",
            example = "FASTEST",
            defaultValue = "FASTEST",
            allowableValues = {"FASTEST", "SHORTEST"}
    )
    @Builder.Default
    private RouteStrategy strategy = RouteStrategy.FASTEST;

    @Schema(
            description = "起点和终点各自允许的最大道路吸附距离，单位为局部坐标单位",
            example = "100.0",
            defaultValue = "100.0"
    )
    @Positive(message = MessageConstants.SNAP_DISTANCE_INVALID)
    @Builder.Default
    private Double maxSnapDistanceLocal = 100.0;
}
