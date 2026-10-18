package zhaolong.dai.nav.routing.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.dto.LocalPointDTO;
import zhaolong.dai.nav.dto.routing.SnapRequestDTO;
import zhaolong.dai.nav.dto.routing.WaypointDTO;
import zhaolong.dai.nav.enums.routing.TravelMode;
import zhaolong.dai.nav.exception.RoadSnapException;
import zhaolong.dai.nav.exception.RoutingNotFoundException;
import zhaolong.dai.nav.poi.service.PoiService;
import zhaolong.dai.nav.routing.domain.SnappedPoint;
import zhaolong.dai.nav.routing.mapper.RoutingMapper;
import zhaolong.dai.nav.routing.mapper.model.SnapRow;
import zhaolong.dai.nav.routing.service.RoadSnapService;
import zhaolong.dai.nav.vo.LocalPointVO;
import zhaolong.dai.nav.vo.poi.PoiVO;
import zhaolong.dai.nav.vo.routing.SnappedPointVO;

import java.util.List;

/** 将局部坐标或 POI 解析并吸附到可通行道路。 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RoadSnapServiceImpl implements RoadSnapService {

    private static final double DEFAULT_MAX_SNAP_DISTANCE = 100.0;

    private final RoutingMapper routingMapper;
    private final PoiService poiService;

    @Override
    public SnappedPointVO snap(SnapRequestDTO request) {
        if (request == null) {
            throw new RoadSnapException(MessageConstants.REQUEST_PARAMETER_INVALID);
        }
        return toVO(snap(
                request.getPoint(),
                defaultMode(request.getTravelMode()),
                request.getMaxSnapDistanceLocal()
        ));
    }

    @Override
    public SnappedPoint snap(LocalPointDTO point, TravelMode mode, Double maxDistance) {
        LocalPointDTO validPoint = validatePoint(point);
        double validDistance = validateMaxDistance(maxDistance);
        TravelMode validMode = defaultMode(mode);

        SnapRow row = routingMapper.selectNearestEdge(
                validPoint.getX(),
                validPoint.getY(),
                validMode.name(),
                validDistance
        );
        if (row == null) {
            throw new RoutingNotFoundException(MessageConstants.ROAD_NOT_FOUND_IN_SNAP_RANGE);
        }

        return new SnappedPoint(
                row.getEdgeId(),
                row.getFraction(),
                row.getSnappedX(),
                row.getSnappedY(),
                row.getDistanceLocal(),
                row.getNetworkVersion()
        );
    }

    @Override
    public SnappedPoint snap(WaypointDTO waypoint, TravelMode mode, Double maxDistance) {
        return snap(resolve(waypoint), mode, maxDistance);
    }

    @Override
    public List<SnappedPoint> snapAll(
            List<WaypointDTO> waypoints, TravelMode mode, Double maxDistance
    ) {
        if (waypoints == null) {
            throw new RoadSnapException(MessageConstants.ROAD_POINT_IS_NULL);
        }
        return waypoints.stream()
                .map(waypoint -> snap(waypoint, mode, maxDistance))
                .toList();
    }

    /** poiId 与 point 必须二选一；POI 坐标统一从 POI 服务读取。 */
    private LocalPointDTO resolve(WaypointDTO waypoint) {
        if (waypoint == null) {
            throw new RoadSnapException(MessageConstants.ROAD_POINT_IS_NULL);
        }

        boolean hasPoi = waypoint.getPoiId() != null;
        boolean hasPoint = waypoint.getPoint() != null;
        if (hasPoi == hasPoint) {
            throw new RoadSnapException(MessageConstants.ROAD_POINT_IS_ERROR);
        }
        if (hasPoint) {
            return validatePoint(waypoint.getPoint());
        }

        PoiVO poi = poiService.getById(waypoint.getPoiId());
        if (poi.getLocation() == null) {
            throw new RoutingNotFoundException(MessageConstants.POI_COORDINATE_MISSING);
        }
        return validatePoint(new LocalPointDTO(
                poi.getLocation().getX(), poi.getLocation().getY()
        ));
    }

    private LocalPointDTO validatePoint(LocalPointDTO point) {
        if (point == null
                || point.getX() == null
                || point.getY() == null
                || !Double.isFinite(point.getX())
                || !Double.isFinite(point.getY())) {
            throw new RoadSnapException(MessageConstants.POINT_COORDINATE_ERROR);
        }
        return point;
    }

    private double validateMaxDistance(Double distance) {
        double value = distance == null ? DEFAULT_MAX_SNAP_DISTANCE : distance;
        if (!Double.isFinite(value) || value <= 0) {
            throw new RoadSnapException(MessageConstants.SNAP_DISTANCE_INVALID);
        }
        return value;
    }

    private TravelMode defaultMode(TravelMode mode) {
        return mode == null ? TravelMode.WALKING : mode;
    }

    @Override
    public SnappedPointVO toVO(SnappedPoint point) {
        return SnappedPointVO.builder()
                .edgeId(point.edgeId())
                .fraction(point.fraction())
                .snappedPoint(new LocalPointVO(point.x(), point.y()))
                .distanceLocal(point.distanceLocal())
                .networkVersion(point.networkVersion())
                .build();
    }
}
