package zhaolong.dai.nav.poi.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import zhaolong.dai.nav.dto.poi.PoiNearbyDTO;
import zhaolong.dai.nav.po.PoiPO;
import zhaolong.dai.nav.poi.mapper.model.PoiRow;

import java.util.List;

@Mapper
public interface PoiMapper extends BaseMapper<PoiPO> {

    List<PoiRow> selectByKeyword(@Param("keyword") String keyword, @Param("limit") Integer limit);

    PoiRow selectDetailById(@Param("id") Long id);

    List<PoiRow> selectPoiByCircle(PoiNearbyDTO query);

    List<PoiRow> selectByViewport(
            @Param("viewport") Double[] viewport,
            @Param("limit") Integer limit
    );

    List<PoiRow> selectByBounds(
            @Param("minX") double minX,
            @Param("minY") double minY,
            @Param("maxX") double maxX,
            @Param("maxY") double maxY
    );
}
