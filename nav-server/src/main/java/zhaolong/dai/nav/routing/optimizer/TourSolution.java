package zhaolong.dai.nav.routing.optimizer;

import java.util.List;

public record TourSolution(List<Integer> visitOrder, double cost) {
}
