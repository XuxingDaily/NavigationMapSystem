package zhaolong.dai.nav.routing.service;

import zhaolong.dai.nav.dto.routing.RouteRequestDTO;
import zhaolong.dai.nav.enums.routing.RouteStrategy;
import zhaolong.dai.nav.enums.routing.TravelMode;
import zhaolong.dai.nav.routing.domain.SnappedPoint;
import zhaolong.dai.nav.vo.routing.RouteVO;

/** 两个路网位置之间的路径规划能力。 */
public interface RoutePlanningService {

    RouteVO route(RouteRequestDTO request);

    RouteVO routeBetween(
            SnappedPoint origin,
            SnappedPoint destination,
            TravelMode mode,
            RouteStrategy strategy
    );
}
