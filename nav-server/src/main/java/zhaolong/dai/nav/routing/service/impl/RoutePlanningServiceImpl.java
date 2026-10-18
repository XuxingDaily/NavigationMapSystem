package zhaolong.dai.nav.routing.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.dto.routing.RouteRequestDTO;
import zhaolong.dai.nav.enums.routing.RouteStrategy;
import zhaolong.dai.nav.enums.routing.TravelMode;
import zhaolong.dai.nav.exception.RoutePlanningException;
import zhaolong.dai.nav.exception.RoutingNotFoundException;
import zhaolong.dai.nav.routing.domain.SnappedPoint;
import zhaolong.dai.nav.routing.mapper.RoutingMapper;
import zhaolong.dai.nav.routing.mapper.model.RouteRow;
import zhaolong.dai.nav.routing.service.RoadSnapService;
import zhaolong.dai.nav.routing.service.RoutePlanningService;
import zhaolong.dai.nav.vo.routing.RouteVO;

/** 负责两点吸附、pgRouting 寻路和路线响应组装。 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RoutePlanningServiceImpl implements RoutePlanningService {

    private static final double SAME_FRACTION_EPSILON = 1.0e-12;

    private final RoutingMapper routingMapper;
    private final RoadSnapService roadSnapService;

    @Override
    public RouteVO route(RouteRequestDTO request) {
        if (request == null) {
            throw new RoutePlanningException(MessageConstants.REQUEST_PARAMETER_INVALID);
        }

        TravelMode mode = defaultMode(request.getTravelMode());
        RouteStrategy strategy = defaultStrategy(request.getStrategy());

        SnappedPoint origin = roadSnapService.snap(
                request.getOrigin(),
                mode,
                request.getMaxSnapDistanceLocal()
        );
        SnappedPoint destination = roadSnapService.snap(
                request.getDestination(),
                mode,
                request.getMaxSnapDistanceLocal()
        );

        return routeBetween(origin, destination, mode, strategy);
    }

    @Override
    public RouteVO routeBetween(
            SnappedPoint origin,
            SnappedPoint destination,
            TravelMode mode,
            RouteStrategy strategy
    ) {
        if (origin == null || destination == null) {
            throw new RoutePlanningException(MessageConstants.ROUTE_ENDPOINT_REQUIRED);
        }

        TravelMode validMode = defaultMode(mode);
        RouteStrategy validStrategy = defaultStrategy(strategy);

        if (origin.edgeId() == destination.edgeId()
                && Math.abs(origin.fraction() - destination.fraction()) < SAME_FRACTION_EPSILON) {
            return RouteVO.builder()
                    .travelMode(validMode)
                    .strategy(validStrategy)
                    .distanceLocal(0.0)
                    .durationSeconds(0.0)
                    .geometryWkt("LINESTRING EMPTY")
                    .originSnap(roadSnapService.toVO(origin))
                    .destinationSnap(roadSnapService.toVO(destination))
                    .networkVersion(Math.max(origin.networkVersion(), destination.networkVersion()))
                    .build();
        }

        RouteRow row = routingMapper.selectRoute(
                origin, destination, validMode.name(), validStrategy.name()
        );
        if (row == null || row.getGeometryWkt() == null) {
            throw new RoutingNotFoundException(MessageConstants.ROUTE_NOT_FOUND);
        }

        return RouteVO.builder()
                .travelMode(validMode)
                .strategy(validStrategy)
                .distanceLocal(row.getDistanceLocal())
                .durationSeconds(row.getDurationSeconds())
                .geometryWkt(row.getGeometryWkt())
                .originSnap(roadSnapService.toVO(origin))
                .destinationSnap(roadSnapService.toVO(destination))
                .networkVersion(row.getNetworkVersion())
                .build();
    }

    private TravelMode defaultMode(TravelMode mode) {
        return mode == null ? TravelMode.WALKING : mode;
    }

    private RouteStrategy defaultStrategy(RouteStrategy strategy) {
        return strategy == null ? RouteStrategy.FASTEST : strategy;
    }
}
