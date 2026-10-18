package zhaolong.dai.nav.poi.service;

import com.baomidou.mybatisplus.spring.service.IService;
import jakarta.validation.Valid;
import zhaolong.dai.nav.dto.poi.PoiNearbyDTO;
import zhaolong.dai.nav.dto.poi.PoiKeywordDTO;
import zhaolong.dai.nav.dto.poi.PoiViewportDTO;
import zhaolong.dai.nav.po.PoiPO;
import zhaolong.dai.nav.vo.poi.PoiListVO;
import zhaolong.dai.nav.vo.poi.PoiVO;

public interface PoiService extends IService<PoiPO> {

    PoiListVO getByKeyword(@Valid PoiKeywordDTO query);

    PoiVO getById(Long id);

    PoiListVO getByNearby(@Valid PoiNearbyDTO query);

    PoiListVO getByViewport(@Valid PoiViewportDTO query);
}
