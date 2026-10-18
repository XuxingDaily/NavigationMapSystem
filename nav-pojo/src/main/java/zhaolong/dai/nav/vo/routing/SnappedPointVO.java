package zhaolong.dai.nav.vo.routing;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.vo.LocalPointVO;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "道路吸附点信息")
public class SnappedPointVO {

    @Schema(description = "道路ID")
    private Long edgeId;

    @Schema(description = "道路上点的相对位置，处于 0 到 1 之间")
    private Double fraction;

    @Schema(description = "吸附点")
    private LocalPointVO snappedPoint;

    @Schema(description = "原点距离吸附点距离")
    private Double distanceLocal;

    @Schema(description = "道路网版本")
    private Long networkVersion;

}
