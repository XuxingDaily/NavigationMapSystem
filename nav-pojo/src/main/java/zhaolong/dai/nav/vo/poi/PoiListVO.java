package zhaolong.dai.nav.vo.poi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PoiListVO {

    // 关键字查询
    private String keyword;

    // 附近查询
    private Double x;
    private Double y;
    private Double radius;

    // 视口查询
    private Double[] bbox;

    // 结果
    private List<PoiVO> items;
    private Integer count;

}
