package zhaolong.dai.nav.routing.mapper.model;

import lombok.Data;

@Data
public class CostMatrixRow {
    private Long startPid;
    private Long endPid;
    private Double aggCost;
}
