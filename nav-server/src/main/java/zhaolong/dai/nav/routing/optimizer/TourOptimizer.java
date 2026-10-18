package zhaolong.dai.nav.routing.optimizer;

import zhaolong.dai.nav.enums.routing.TourAlgorithm;

public interface TourOptimizer {

    TourAlgorithm algorithm();

    boolean guaranteesOptimal();

    TourSolution solve(
            double[][] costMatrix,
            int fixedStartIndex,
            Integer fixedEndIndex,
            boolean roundTrip
    );
}
