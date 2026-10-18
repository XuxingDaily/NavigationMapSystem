package zhaolong.dai.nav.routing.optimizer;

import org.junit.jupiter.api.Test;
import zhaolong.dai.nav.exception.RoutingNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HeldKarpTourOptimizerTest {

    private final HeldKarpTourOptimizer optimizer = new HeldKarpTourOptimizer();

    @Test
    void shouldFindOpenTourWithFixedStartAndEnd() {
        double[][] matrix = {
                {0, 1, 5},
                {4, 0, 1},
                {2, 5, 0}
        };

        TourSolution solution = optimizer.solve(matrix, 0, 2, false);

        assertThat(solution.visitOrder()).containsExactly(0, 1, 2);
        assertThat(solution.cost()).isEqualTo(2.0);
    }

    @Test
    void shouldReturnToStartForRoundTrip() {
        double[][] matrix = {
                {0, 1, 10},
                {1, 0, 2},
                {10, 2, 0}
        };

        TourSolution solution = optimizer.solve(matrix, 0, null, true);

        assertThat(solution.visitOrder()).startsWith(0).endsWith(0).hasSize(4);
        assertThat(solution.visitOrder().subList(0, 3)).containsExactlyInAnyOrder(0, 1, 2);
        assertThat(solution.cost()).isEqualTo(13.0);
    }

    @Test
    void shouldRejectDisconnectedTour() {
        double infinity = Double.POSITIVE_INFINITY;
        double[][] matrix = {
                {0, 1, infinity},
                {infinity, 0, infinity},
                {infinity, infinity, 0}
        };

        assertThatThrownBy(() -> optimizer.solve(matrix, 0, null, true))
                .isInstanceOf(RoutingNotFoundException.class);
    }
}
