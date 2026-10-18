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
import zhaolong.dai.nav.dto.LocalPointDTO;
import zhaolong.dai.nav.enums.routing.TravelMode;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "道路吸附查询参数")
public class SnapRequestDTO {

    @Schema(
            description = "需要吸附到路网的原始局部坐标",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = MessageConstants.SNAP_POINT_REQUIRED)
    @Valid
    private LocalPointDTO point;

    @Schema(
            description = "出行方式。WALKING 只匹配允许步行的道路；DRIVING 只匹配允许驾车的道路",
            example = "WALKING",
            defaultValue = "WALKING",
            allowableValues = {"WALKING", "DRIVING"}
    )
    @Builder.Default
    private TravelMode travelMode = TravelMode.WALKING;

    @Schema(
            description = "允许原始点到道路的最大吸附距离，单位为当前局部坐标单位；范围内没有道路时返回 404",
            example = "100.0",
            defaultValue = "100.0"
    )
    @Positive(message = MessageConstants.SNAP_DISTANCE_INVALID)
    @Builder.Default
    private Double maxSnapDistanceLocal = 100.0;

}
