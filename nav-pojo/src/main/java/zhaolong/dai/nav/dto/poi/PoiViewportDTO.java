package zhaolong.dai.nav.dto.poi;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import zhaolong.dai.nav.constans.MessageConstants;

@Data
@Schema(description = "视口 POI 查询参数")
public class PoiViewportDTO {

    @Schema(description = "视口查询坐标参数，地理坐标")
    @NotNull
    @Size(min = 4, max = 4)
    private Double[] viewport;

    @Schema(
            description = "最大返回数量",
            example = "20",
            defaultValue = "20"
    )
    @Min(value = 1, message = MessageConstants.POI_SEARCH_LIMIT_MIN)
    @Max(value = 10000, message = MessageConstants.POI_SEARCH_LIMIT_MAX)
    private Integer limit = 20;

}
