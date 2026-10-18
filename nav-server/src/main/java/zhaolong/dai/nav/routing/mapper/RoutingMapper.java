package zhaolong.dai.nav.routing.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import zhaolong.dai.nav.routing.domain.SnappedPoint;
import zhaolong.dai.nav.routing.mapper.model.CostMatrixRow;
import zhaolong.dai.nav.routing.mapper.model.RouteRow;
import zhaolong.dai.nav.routing.mapper.model.SnapRow;

import java.util.List;

@Mapper
public interface RoutingMapper {

    SnapRow selectNearestEdge(
            @Param("x") double x,
            @Param("y") double y,
            @Param("travelMode") String travelMode,
            @Param("maxDistanceLocal") double maxDistanceLocal
    );

    RouteRow selectRoute(
            @Param("origin") SnappedPoint origin,
            @Param("destination") SnappedPoint destination,
            @Param("travelMode") String travelMode,
            @Param("strategy") String strategy
    );

    List<CostMatrixRow> selectCostMatrix(
            @Param("pointsJson") String pointsJson,
            @Param("travelMode") String travelMode,
            @Param("strategy") String strategy
    );

}
