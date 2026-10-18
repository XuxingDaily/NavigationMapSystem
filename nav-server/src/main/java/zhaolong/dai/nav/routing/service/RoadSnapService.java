package zhaolong.dai.nav.routing.service;

import zhaolong.dai.nav.dto.LocalPointDTO;
import zhaolong.dai.nav.dto.routing.SnapRequestDTO;
import zhaolong.dai.nav.dto.routing.WaypointDTO;
import zhaolong.dai.nav.enums.routing.TravelMode;
import zhaolong.dai.nav.routing.domain.SnappedPoint;
import zhaolong.dai.nav.vo.routing.SnappedPointVO;

import java.util.List;

public interface RoadSnapService {

    SnappedPointVO snap(SnapRequestDTO request);

    SnappedPoint snap(LocalPointDTO point, TravelMode mode, Double maxDistance);

    SnappedPoint snap(WaypointDTO waypoint, TravelMode mode, Double maxDistance);

    List<SnappedPoint> snapAll(
            List<WaypointDTO> waypoints,
            TravelMode mode,
            Double maxDistance
    );

    SnappedPointVO toVO(SnappedPoint point);
}
