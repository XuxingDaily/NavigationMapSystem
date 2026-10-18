package zhaolong.dai.nav.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.constans.MessageConstants;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "未知坐标系下的局部平面坐标")
public class LocalPointDTO {

    @Schema(
            description = "局部平面坐标 X；必须与 poi.geom_local、road_edge.geom_local 使用同一坐标空间",
            example = "50534.254573",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = MessageConstants.POINT_X_REQUIRED)
    private Double x;

    @Schema(
            description = "局部平面坐标 Y；当前不是纬度",
            example = "22086.360885",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = MessageConstants.POINT_Y_REQUIRED)
    private Double y;
}
