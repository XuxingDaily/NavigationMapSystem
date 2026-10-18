package zhaolong.dai.nav.routing.service;

import zhaolong.dai.nav.dto.routing.TourRequestDTO;
import zhaolong.dai.nav.vo.routing.TourPlanVO;

/** 多点访问顺序优化与分段路线组装能力。 */
public interface TourPlanningService {

    TourPlanVO planTour(TourRequestDTO request);
}
