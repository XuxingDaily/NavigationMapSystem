package zhaolong.dai.nav.vo.poi;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import zhaolong.dai.nav.vo.LocalPointVO;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "POI 信息")
public class PoiVO {

    @Schema(example = "1001")
    private Long id;

    @Schema(example = "广州大学")
    private String name;

    private String context;

    private LocalPointVO location;

    private Long dataVersion;

}
