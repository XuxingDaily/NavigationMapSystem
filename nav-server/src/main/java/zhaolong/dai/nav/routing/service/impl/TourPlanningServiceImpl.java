package zhaolong.dai.nav.routing.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.dto.routing.TourRequestDTO;
import zhaolong.dai.nav.dto.routing.WaypointDTO;
import zhaolong.dai.nav.enums.routing.RouteStrategy;
import zhaolong.dai.nav.enums.routing.TravelMode;
import zhaolong.dai.nav.exception.TourPlanningException;
import zhaolong.dai.nav.routing.domain.SnappedPoint;
import zhaolong.dai.nav.routing.mapper.RoutingMapper;
import zhaolong.dai.nav.routing.mapper.model.CostMatrixRow;
import zhaolong.dai.nav.routing.optimizer.TourOptimizer;
import zhaolong.dai.nav.routing.optimizer.TourOptimizerSelector;
import zhaolong.dai.nav.routing.optimizer.TourSolution;
import zhaolong.dai.nav.routing.service.RoadSnapService;
import zhaolong.dai.nav.routing.service.RoutePlanningService;
import zhaolong.dai.nav.routing.service.TourPlanningService;
import zhaolong.dai.nav.vo.routing.RouteLegVO;
import zhaolong.dai.nav.vo.routing.RouteVO;
import zhaolong.dai.nav.vo.routing.TourPlanVO;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** 负责成本矩阵、TSP 顺序优化以及各段路线的汇总。 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class TourPlanningServiceImpl implements TourPlanningService {

    private final RoutingMapper routingMapper;
    private final RoadSnapService roadSnapService;
    private final RoutePlanningService routePlanningService;
    private final TourOptimizerSelector tourOptimizerSelector;

    /**
     * 多目标点的路径规划（ATSP）
     *
     *  1. 请求参数
     *  2. 所有目标点吸附到路网
     *  3. pgRouting 计算成本矩阵
     *  4. ATSP 优化访问顺序
     *  5. 按顺序逐段计算完整路线
     *  6. 汇总距离、时间和几何
     *
     * @param request
     * @return
     */
    @Override
    public TourPlanVO planTour(TourRequestDTO request) {
        if (request == null) {
            throw new TourPlanningException(MessageConstants.REQUEST_PARAMETER_INVALID);
        }

        List<WaypointDTO> stops = request.getStops();
        if (stops == null || stops.size() < 2 || stops.size() > 50) {
            throw new TourPlanningException(MessageConstants.TOUR_STOP_COUNT_INVALID);
        }

        // 读取模式、策略并补充默认参数
        TravelMode mode = defaultMode(request.getTravelMode());
        RouteStrategy strategy = defaultStrategy(request.getStrategy());
        // 默认闭环游览
        boolean roundTrip = request.getRoundTrip() == null || request.getRoundTrip();
        // 没有固定起点，就默认从 stops[0] 出发
        int fixedStart = request.getFixedStartIndex() == null ? 0 : request.getFixedStartIndex();
        // 是否需要固定终点
        // 1. roundTrip = false, fixedEnd = null：终点自由；
        // 2. roundTrip = false, fixedEnd != null：必须以 stops[fixedEnd] 结束。
        Integer fixedEnd = request.getFixedEndIndex();

        // 在访问数据库前选择算法，强制 Held-Karp 处理超限点数时可以尽早失败。
        TourOptimizer optimizer = tourOptimizerSelector.select(
                request.getAlgorithm(), stops.size()
        );

        // 所有路径点都吸附到路网，确保可计算
        List<SnappedPoint> snapped = roadSnapService.snapAll(
                stops,
                mode,
                request.getMaxSnapDistanceLocal()
        );

        // 计算成本矩阵并求解TSP或优化得到全局/局部最优解
        TourSolution solution = optimizer.solve(
                // 计算成本矩阵
                loadCostMatrix(snapped, mode, strategy),
                fixedStart,
                fixedEnd,
                roundTrip
        );

        // 初始化汇总变量
        List<RouteLegVO> legs = new ArrayList<>();
        double totalDistance = 0.0;
        double totalDuration = 0.0;
        long networkVersion = snapped.stream()
                .mapToLong(SnappedPoint::networkVersion)
                .max()
                .orElse(1L);

        // 按照结果顺序，调用最短路算法，构建结果集
        List<Integer> order = solution.visitOrder();
        for (int i = 0; i < order.size() - 1; i++) {
            int from = order.get(i);
            int to = order.get(i + 1);

            // 用最短路径算法，重点得到几何数据
            RouteVO route = routePlanningService.routeBetween(
                    snapped.get(from),
                    snapped.get(to),
                    mode,
                    strategy
            );

            // 汇总路线指标
            totalDistance += route.getDistanceLocal();
            totalDuration += route.getDurationSeconds();
            networkVersion = Math.max(networkVersion, route.getNetworkVersion());

            legs.add(RouteLegVO.builder()
                    .fromStopIndex(from)
                    .toStopIndex(to)
                    .distanceLocal(route.getDistanceLocal())
                    .durationSeconds(route.getDurationSeconds())
                    .geometryWkt(route.getGeometryWkt())
                    .build());
        }

        return TourPlanVO.builder()
                .visitOrder(order)
                .travelMode(mode)
                .strategy(strategy)
                .roundTrip(roundTrip)
                .algorithm(optimizer.algorithm())
                .optimal(optimizer.guaranteesOptimal())
                .optimizedCost(solution.cost())
                .optimizedCostUnit(strategy == RouteStrategy.FASTEST
                        ? "SECONDS" : "LOCAL_DISTANCE")
                .totalDistanceLocal(totalDistance)
                .totalDurationSeconds(totalDuration)
                .legs(List.copyOf(legs))
                .snappedStops(snapped.stream().map(roadSnapService::toVO).toList())
                .networkVersion(networkVersion)
                .build();
    }

    private double[][] loadCostMatrix(
            List<SnappedPoint> points,
            TravelMode mode,
            RouteStrategy strategy
    ) {
        int size = points.size();

        double[][] matrix = new double[size][size];
        for (double[] row : matrix) {
            Arrays.fill(row, Double.POSITIVE_INFINITY);
        }
        for (int i = 0; i < size; i++) {
            matrix[i][i] = 0.0;
        }

        List<CostMatrixRow> rows = routingMapper.selectCostMatrix(
                pointsJson(points),
                mode.name(),
                strategy.name()
        );

        for (CostMatrixRow row : rows) {
            // pgRouting 返回的 pid 从 1 开始，而 Java 数组从 0 开始
            int from = Math.toIntExact(row.getStartPid()) - 1;
            int to = Math.toIntExact(row.getEndPid()) - 1;
            if (from >= 0
                    && from < size
                    && to >= 0 && to < size
                    && row.getAggCost() != null) {
                matrix[from][to] = row.getAggCost();
            }
        }
        return matrix;
    }

    private String pointsJson(List<SnappedPoint> points) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < points.size(); i++) {
            if (i > 0) {
                json.append(',');
            }
            SnappedPoint point = points.get(i);
            json.append("{\"pid\":").append(i + 1)
                    .append(",\"edge_id\":").append(point.edgeId())
                    .append(",\"fraction\":").append(point.fraction())
                    .append(",\"side\":\"b\"}");
        }
        return json.append(']').toString();
    }

    private TravelMode defaultMode(TravelMode mode) {
        return mode == null ? TravelMode.WALKING : mode;
    }

    private RouteStrategy defaultStrategy(RouteStrategy strategy) {
        return strategy == null ? RouteStrategy.FASTEST : strategy;
    }
}
