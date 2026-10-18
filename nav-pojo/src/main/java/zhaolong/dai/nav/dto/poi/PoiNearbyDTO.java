package zhaolong.dai.nav.dto.poi;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import zhaolong.dai.nav.constans.MessageConstants;

@Data
@Schema(description = "附近 POI 查询参数")
public class PoiNearbyDTO {

    @Schema(description = "指定横坐标 x")
    @NotNull
    private Double x;

    @Schema(description = "指定纵坐标 y")
    @NotNull
    private Double y;

    @Schema(description = "搜索半径（局部坐标单位）")
    @NotNull
    @Positive
    private Double radius;

    @Schema(
            description = "最大返回数量",
            example = "20",
            defaultValue = "20"
    )
    @Min(value = 1, message = MessageConstants.POI_SEARCH_LIMIT_MIN)
    @Max(value = 10000, message = MessageConstants.POI_SEARCH_LIMIT_MAX)
    private Integer limit = 20;

}
