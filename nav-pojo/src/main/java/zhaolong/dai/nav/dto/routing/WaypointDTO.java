package zhaolong.dai.nav.dto.routing;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.dto.LocalPointDTO;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "路径点。可引用已有 POI，也可直接提供局部坐标；poiId 和 point 必须且只能填写一个")
public class WaypointDTO {

    @Positive
    @Schema(
            description = "POI 主键。服务端会读取该 POI 的 geom_local 后进行道路吸附；与 point 二选一",
            example = "1001"
    )
    private Long poiId;

    @Valid
    @Schema(description = "临时路径点的局部坐标，例如用户当前位置；与 poiId 二选一")
    private LocalPointDTO point;
}
