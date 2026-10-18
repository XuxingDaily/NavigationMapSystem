package zhaolong.dai.nav.routing.optimizer;

import org.junit.jupiter.api.Test;
import zhaolong.dai.nav.enums.routing.TourAlgorithm;
import zhaolong.dai.nav.exception.TourPlanningException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TourOptimizerSelectorTest {

    private final HeldKarpTourOptimizer heldKarp = new HeldKarpTourOptimizer();
    private final NearestNeighborTwoOptOptimizer heuristic =
            new NearestNeighborTwoOptOptimizer();
    private final TourOptimizerSelector selector =
            new TourOptimizerSelector(heldKarp, heuristic);

    @Test
    void shouldSelectByAutoThreshold() {
        assertThat(selector.select(TourAlgorithm.AUTO, 12)).isSameAs(heldKarp);
        assertThat(selector.select(TourAlgorithm.AUTO, 13)).isSameAs(heuristic);
    }

    @Test
    void shouldHonorExplicitHeuristicSelection() {
        assertThat(selector.select(TourAlgorithm.NN_TWO_OPT, 3)).isSameAs(heuristic);
    }

    @Test
    void shouldRejectForcedHeldKarpAboveLimit() {
        assertThatThrownBy(() -> selector.select(TourAlgorithm.HELD_KARP, 13))
                .isInstanceOf(TourPlanningException.class);
    }
}
