package zhaolong.dai.nav.dto.poi;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import zhaolong.dai.nav.constans.MessageConstants;

@Data
@Schema(description = "POI 搜索条件")
public class PoiKeywordDTO {

    @Schema(
            description = "POI 名称关键词",
            example = "大学"
    )
    @Size(max=100, message = MessageConstants.POI_SEARCH_KEYWORD_LENGTH_LIMIT)
    private String keyword;

    @Schema(
            description = "最大返回数量",
            example = "20",
            defaultValue = "20"
    )
    @Min(value = 1, message = MessageConstants.POI_SEARCH_LIMIT_MIN)
    @Max(value = 10000, message = MessageConstants.POI_SEARCH_LIMIT_MAX)
    private Integer limit = 20;

    public String getNormalizedKeyword() {
        return keyword == null ? null : keyword.strip();
    }
}
