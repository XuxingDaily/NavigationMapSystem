package zhaolong.dai.nav.routing.optimizer;

import org.junit.jupiter.api.Test;
import zhaolong.dai.nav.exception.RoutingNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NearestNeighborTwoOptOptimizerTest {

    private final NearestNeighborTwoOptOptimizer optimizer =
            new NearestNeighborTwoOptOptimizer();

    @Test
    void shouldImproveNearestNeighborRoundTripWithTwoOpt() {
        double[][] matrix = {
                {0, 1, 2, 50},
                {50, 0, 1, 1},
                {50, 1, 0, 10},
                {1, 50, 50, 0}
        };

        TourSolution solution = optimizer.solve(matrix, 0, null, true);

        assertThat(solution.visitOrder()).containsExactly(0, 2, 1, 3, 0);
        assertThat(solution.cost()).isEqualTo(5.0);
    }

    @Test
    void shouldPreserveFixedStartAndEndForOpenTour() {
        double[][] matrix = {
                {0, 1, 2, 20},
                {5, 0, 1, 3},
                {5, 1, 0, 1},
                {5, 5, 5, 0}
        };

        TourSolution solution = optimizer.solve(matrix, 0, 3, false);

        assertThat(solution.visitOrder()).startsWith(0).endsWith(3);
        assertThat(solution.visitOrder()).containsExactlyInAnyOrder(0, 1, 2, 3);
        assertThat(solution.cost()).isEqualTo(3.0);
    }

    @Test
    void shouldUseDirectedCostsWhenEvaluatingReversedSegment() {
        double[][] matrix = {
                {0, 1, 2, 20},
                {20, 0, 1, 1},
                {20, 9, 0, 20},
                {1, 20, 20, 0}
        };

        TourSolution solution = optimizer.solve(matrix, 0, null, true);

        // 反转为 0->2->1->3->0 时必须使用 2->1=9，而不是 1->2=1。
        assertThat(solution.cost()).isEqualTo(13.0);
        assertThat(solution.visitOrder()).containsExactly(0, 2, 1, 3, 0);
    }

    @Test
    void shouldRejectWhenNearestNeighborCannotBuildReachableTour() {
        double infinity = Double.POSITIVE_INFINITY;
        double[][] matrix = {
                {0, 1, infinity},
                {infinity, 0, 1},
                {infinity, infinity, 0}
        };

        assertThatThrownBy(() -> optimizer.solve(matrix, 0, null, true))
                .isInstanceOf(RoutingNotFoundException.class);
    }
}
