package zhaolong.dai.nav.routing.optimizer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import zhaolong.dai.nav.constans.MessageConstants;
import zhaolong.dai.nav.enums.routing.TourAlgorithm;
import zhaolong.dai.nav.exception.TourPlanningException;

@Component
@RequiredArgsConstructor
public class TourOptimizerSelector {

    private final HeldKarpTourOptimizer heldKarpTourOptimizer;
    private final NearestNeighborTwoOptOptimizer nearestNeighborTwoOptOptimizer;

    public TourOptimizer select(TourAlgorithm requested, int pointCount) {
        TourAlgorithm algorithm = requested == null ? TourAlgorithm.AUTO : requested;
        return switch (algorithm) {
            case AUTO -> pointCount <= 12
                    ? heldKarpTourOptimizer
                    : nearestNeighborTwoOptOptimizer;
            case HELD_KARP -> {
                if (pointCount > 12) {
                    throw new TourPlanningException(MessageConstants.HELD_KARP_POINT_LIMIT);
                }
                yield heldKarpTourOptimizer;
            }
            case NN_TWO_OPT -> nearestNeighborTwoOptOptimizer;
        };
    }

}
