package zhaolong.dai.nav.routing.optimizer;

import org.springframework.stereotype.Component;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.enums.routing.TourAlgorithm;
import zhaolong.dai.nav.exception.RoutingNotFoundException;
import zhaolong.dai.nav.exception.TourPlanningException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 最近邻初始解 + 2-opt 局部搜索的 ATSP 启发式优化器。
 *
 * <p>成本矩阵可能由单行道形成，因此不保证对称。2-opt 反转一段访问顺序后，
 * 被反转区间内每条边的方向都会变化；本实现会重新计算完整候选路线成本，
 * 不使用只比较四条边的对称 TSP 增量公式。</p>
 */
@Component
public class NearestNeighborTwoOptOptimizer implements TourOptimizer {

    private static final int MAX_POINT_COUNT = 50;
    private static final int MAX_TWO_OPT_PASSES = 100;
    private static final double IMPROVEMENT_EPSILON = 1.0e-9;

    @Override
    public TourAlgorithm algorithm() {
        return TourAlgorithm.NN_TWO_OPT;
    }

    @Override
    public boolean guaranteesOptimal() {
        return false;
    }

    /**
     * 先用最近邻规则生成可行初始顺序，再用 best-improvement 2-opt 迭代优化。
     */
    @Override
    public TourSolution solve(
            double[][] costMatrix,
            int fixedStartIndex,
            Integer fixedEndIndex,
            boolean roundTrip
    ) {
        validate(costMatrix, fixedStartIndex, fixedEndIndex, roundTrip);

        List<Integer> initialRoute = buildNearestNeighborRoute(
                costMatrix,
                fixedStartIndex,
                fixedEndIndex,
                roundTrip
        );

        return improveWithTwoOpt(costMatrix, initialRoute, fixedEndIndex, roundTrip);
    }

    /**
     * 构造最近邻初始解。非闭环固定终点会被保留到最后；闭环最后追加固定起点。
     */
    private List<Integer> buildNearestNeighborRoute(
            double[][] matrix,
            int start,
            Integer fixedEnd,
            boolean roundTrip
    ) {
        int n = matrix.length;

        boolean[] visited = new boolean[n];
        visited[start] = true;

        List<Integer> route = new ArrayList<>(n + (roundTrip ? 1 : 0));
        route.add(start);

        int current = start;

        // 固定终点不参与最近邻选择，普通点全部访问后再追加到末尾。
        int targetSizeBeforeEnd = fixedEnd == null ? n : n - 1;

        while (route.size() < targetSizeBeforeEnd) {
            boolean selectingLastOrdinary = route.size() == targetSizeBeforeEnd - 1;
            int next = nearestReachable(
                    matrix,
                    current,
                    visited,
                    fixedEnd,
                    selectingLastOrdinary ? terminalAfterOrdinary(start, fixedEnd, roundTrip) : null
            );
            if (next < 0) {
                throw noHeuristicRoute();
            }
            route.add(next);
            visited[next] = true;
            current = next;
        }

        if (fixedEnd != null) {
            if (!Double.isFinite(matrix[current][fixedEnd])) {
                throw noHeuristicRoute();
            }
            route.add(fixedEnd);
        } else if (roundTrip) {
            if (!Double.isFinite(matrix[current][start])) {
                throw noHeuristicRoute();
            }
            route.add(start);
        }

        return List.copyOf(route);
    }

    /**
     * 选择 current 可达的最低成本未访问点。terminal 不为空时，还要求候选点可达终点。
     */
    private int nearestReachable(
            double[][] matrix,
            int current,
            boolean[] visited,
            Integer reservedEnd,
            Integer terminal
    ) {
        int nearest = -1;
        double nearestCost = Double.POSITIVE_INFINITY;
        for (int candidate = 0; candidate < matrix.length; candidate++) {
            if (visited[candidate] || (reservedEnd != null && candidate == reservedEnd)) {
                continue;
            }
            double cost = matrix[current][candidate];
            if (!Double.isFinite(cost)) {
                continue;
            }
            if (terminal != null && !Double.isFinite(matrix[candidate][terminal])) {
                continue;
            }
            if (cost < nearestCost) {
                nearest = candidate;
                nearestCost = cost;
            }
        }
        return nearest;
    }

    private Integer terminalAfterOrdinary(int start, Integer fixedEnd, boolean roundTrip) {
        if (fixedEnd != null) {
            return fixedEnd;
        }
        return roundTrip ? start : null;
    }

    /**
     * 枚举所有允许反转的区间，每轮接受成本最低的候选解，直到局部最优或达到上限。
     */
    private TourSolution improveWithTwoOpt(
            double[][] matrix,
            List<Integer> initialRoute,
            Integer fixedEnd,
            boolean roundTrip
    ) {
        List<Integer> bestRoute = new ArrayList<>(initialRoute);
        double bestCost = routeCost(bestRoute, matrix);

        // 下标 0 是固定起点；闭环末尾的重复起点和固定终点也不能参与反转。
        int lastMovableIndex = bestRoute.size() - 1;
        if (roundTrip || fixedEnd != null) {
            lastMovableIndex--;
        }

        for (int pass = 0; pass < MAX_TWO_OPT_PASSES; pass++) {
            List<Integer> passBestRoute = bestRoute;
            double passBestCost = bestCost;

            for (int from = 1; from < lastMovableIndex; from++) {
                for (int to = from + 1; to <= lastMovableIndex; to++) {
                    List<Integer> candidate = new ArrayList<>(bestRoute);
                    Collections.reverse(candidate.subList(from, to + 1));
                    double candidateCost = routeCost(candidate, matrix);
                    if (candidateCost + IMPROVEMENT_EPSILON < passBestCost) {
                        passBestRoute = candidate;
                        passBestCost = candidateCost;
                    }
                }
            }

            if (passBestRoute == bestRoute) {
                break;
            }
            bestRoute = passBestRoute;
            bestCost = passBestCost;
        }

        return new TourSolution(List.copyOf(bestRoute), bestCost);
    }

    /** 对 ATSP 候选顺序逐边完整计价；任何一段不可达时整条候选路线不可用。 */
    private double routeCost(List<Integer> route, double[][] matrix) {
        double cost = 0.0;
        for (int i = 0; i < route.size() - 1; i++) {
            double edgeCost = matrix[route.get(i)][route.get(i + 1)];
            if (!Double.isFinite(edgeCost)) {
                return Double.POSITIVE_INFINITY;
            }
            cost += edgeCost;
        }
        return cost;
    }

    private void validate(double[][] matrix, int start, Integer end, boolean roundTrip) {
        if (matrix == null || matrix.length < 2 || matrix.length > MAX_POINT_COUNT) {
            throw new TourPlanningException(MessageConstants.HEURISTIC_COST_MATRIX_SIZE_INVALID);
        }
        int n = matrix.length;
        for (double[] row : matrix) {
            if (row == null || row.length != n) {
                throw new TourPlanningException(MessageConstants.COST_MATRIX_NOT_SQUARE);
            }
            for (double cost : row) {
                if (Double.isNaN(cost) || cost == Double.NEGATIVE_INFINITY || cost < 0.0) {
                    throw new TourPlanningException(MessageConstants.COST_MATRIX_VALUE_INVALID);
                }
            }
        }
        if (start < 0 || start >= n) {
            throw new TourPlanningException(MessageConstants.TOUR_START_INDEX_OUT_OF_RANGE);
        }
        if (end != null && (end < 0 || end >= n)) {
            throw new TourPlanningException(MessageConstants.TOUR_END_INDEX_OUT_OF_RANGE);
        }
        if (roundTrip && end != null) {
            throw new TourPlanningException(MessageConstants.ROUND_TRIP_END_CONFLICT);
        }
        if (!roundTrip && end != null && end == start) {
            throw new TourPlanningException(MessageConstants.OPEN_TOUR_SAME_ENDPOINT);
        }
    }

    private RoutingNotFoundException noHeuristicRoute() {
        return new RoutingNotFoundException(MessageConstants.HEURISTIC_ROUTE_NOT_FOUND);
    }
}
