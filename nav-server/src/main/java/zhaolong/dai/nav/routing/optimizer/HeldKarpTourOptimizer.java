package zhaolong.dai.nav.routing.optimizer;

import org.springframework.stereotype.Component;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.enums.routing.TourAlgorithm;
import zhaolong.dai.nav.exception.RoutingNotFoundException;
import zhaolong.dai.nav.exception.TourPlanningException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 基于 Held–Karp 状态压缩动态规划的精确 TSP 求解器。
 *
 * <p>输入不是景点之间的直线距离，而是 pgRouting 计算得到的真实路网成本矩阵。
 * 矩阵允许 {@code cost[i][j] != cost[j][i]}，因此该实现也适用于单行道产生的
 * 非对称旅行商问题（ATSP）。</p>
 *
 * <p>动态规划状态定义：</p>
 * <pre>
 * dp[mask][last]
 *     mask：已经访问的路径点集合，第 i 位为 1 表示 stops[i] 已访问
 *     last：当前停留的最后一个路径点
 *     值：从固定起点出发，访问 mask 中所有点并停在 last 的最小成本
 * </pre>
 *
 * <p>时间复杂度为 O(n² × 2ⁿ)，空间复杂度为 O(n × 2ⁿ)。为避免接口请求导致
 * 指数级资源消耗，当前业务将路径点数量限制为 2～12。</p>
 */
@Component
public class HeldKarpTourOptimizer implements TourOptimizer {

    @Override
    public TourAlgorithm algorithm() {
        return TourAlgorithm.HELD_KARP;
    }

    @Override
    public boolean guaranteesOptimal() {
        return true;
    }

    /**
     * 求解满足给定起终点约束的最优访问顺序。
     *
     * @param costMatrix       有向成本矩阵；正无穷表示对应方向不可达
     * @param fixedStartIndex  固定起点在 stops/矩阵中的下标
     * @param fixedEndIndex    非闭环路线的固定终点；为 null 时终点自由
     * @param roundTrip        是否在访问所有点后回到固定起点
     * @return 最优下标顺序及总成本；闭环结果会在末尾再次包含起点下标
     * @throws IllegalArgumentException 输入矩阵或起终点约束不合法
     * @throws RoutingNotFoundException 不存在覆盖全部路径点的可达路线
     */
    @Override
    public TourSolution solve(
            double[][] costMatrix,
            int fixedStartIndex,
            Integer fixedEndIndex,
            boolean roundTrip
    ) {
        validate(costMatrix, fixedStartIndex, fixedEndIndex, roundTrip);

        int n = costMatrix.length;

        // n 个点一共有 2^n 个访问集合；fullMask 的每一位都是 1，表示全部已访问。
        int stateCount = 1 << n;
        int fullMask = stateCount - 1;

        // parent 保存最优状态的前驱节点，用于在计算结束后恢复完整访问顺序。
        double[][] dp = new double[stateCount][n];
        int[][] parent = new int[stateCount][n];

        // 默认所有状态不可达，只有“已访问固定起点且停在起点”的初始成本为 0。
        for (int mask = 0; mask < stateCount; mask++) {
            Arrays.fill(dp[mask], Double.POSITIVE_INFINITY);
            Arrays.fill(parent[mask], -1);
        }

        int startMask = 1 << fixedStartIndex;
        dp[startMask][fixedStartIndex] = 0.0;

        // 枚举访问集合、当前终点和下一个未访问点，执行状态转移。
        for (int mask = 0; mask < stateCount; mask++) {
            // 合法路线必须包含固定起点。
            if ((mask & startMask) == 0) {
                continue;
            }
            for (int last = 0; last < n; last++) {
                if (!Double.isFinite(dp[mask][last])) {
                    continue;
                }
                for (int next = 0; next < n; next++) {
                    // 已访问的点不能重复访问；正无穷表示 last -> next 在路网上不可达。
                    if ((mask & (1 << next)) != 0 || !Double.isFinite(costMatrix[last][next])) {
                        continue;
                    }

                    int nextMask = mask | (1 << next);
                    // 固定终点必须最后访问，不能在仍有其他未访问点时提前进入。
                    if (!roundTrip && fixedEndIndex != null
                            && next == fixedEndIndex && nextMask != fullMask) {
                        continue;
                    }

                    // 用经过 last 的新路径松弛 dp[nextMask][next]。
                    double candidate = dp[mask][last] + costMatrix[last][next];
                    if (candidate < dp[nextMask][next]) {
                        dp[nextMask][next] = candidate;
                        parent[nextMask][next] = last;
                    }
                }
            }
        }

        /*
         * 从访问全部点的状态中选择最终答案：
         * 1. 闭环：枚举最后一个点，并加上 last -> start 的返程成本；
         * 2. 固定终点：只允许 fixedEndIndex 作为最后一个点；
         * 3. 自由终点：在所有可能的最后一个点中选择成本最小者。
         */
        int bestLast = -1;
        double bestCost = Double.POSITIVE_INFINITY;
        for (int last = 0; last < n; last++) {
            if (last == fixedStartIndex && n > 1) {
                continue;
            }
            if (!roundTrip && fixedEndIndex != null && last != fixedEndIndex) {
                continue;
            }

            double candidate = dp[fullMask][last];
            if (roundTrip) {
                if (!Double.isFinite(costMatrix[last][fixedStartIndex])) {
                    continue;
                }
                candidate += costMatrix[last][fixedStartIndex];
            }
            if (candidate < bestCost) {
                bestCost = candidate;
                bestLast = last;
            }
        }

        // bestLast 不存在，说明有路径点无法纳入一条完整可达路线。
        if (bestLast < 0 || !Double.isFinite(bestCost)) {
            throw new RoutingNotFoundException(MessageConstants.TOUR_ROUTE_NOT_FOUND);
        }

        // 从最终状态沿 parent 逆向回溯，再反转得到从起点开始的访问顺序。
        List<Integer> reverseOrder = new ArrayList<>(n + 1);
        int mask = fullMask;
        int current = bestLast;
        while (current >= 0) {
            reverseOrder.add(current);
            int previous = parent[mask][current];
            mask ^= 1 << current;
            current = previous;
        }
        Collections.reverse(reverseOrder);

        // 闭环路线在响应末尾重复起点，例如 [0, 2, 1, 0]。
        if (roundTrip) {
            reverseOrder.add(fixedStartIndex);
        }

        return new TourSolution(List.copyOf(reverseOrder), bestCost);
    }

    /**
     * 校验矩阵规模、方阵结构和固定起终点约束。
     */
    private void validate(
            double[][] matrix,
            int start,
            Integer end,
            boolean roundTrip
    ) {
        if (matrix == null || matrix.length < 2 || matrix.length > 12) {
            throw new TourPlanningException(MessageConstants.COST_MATRIX_SIZE_INVALID);
        }
        int n = matrix.length;
        for (double[] row : matrix) {
            if (row == null || row.length != n) {
                throw new TourPlanningException(MessageConstants.COST_MATRIX_NOT_SQUARE);
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
}
