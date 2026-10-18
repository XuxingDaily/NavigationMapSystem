package zhaolong.dai.nav.poi.mapper.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PoiRow {

    private Long id;
    private String name;
    private String context;
    private Double x;
    private Double y;
    private String coordinateStatus;
    private Long dataVersion;

}
