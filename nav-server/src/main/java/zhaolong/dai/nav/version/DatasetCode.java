package zhaolong.dai.nav.version;

/**
 * 可以独立变更、独立失效缓存的数据集。
 */
public enum DatasetCode {

    POI("poi"),
    ROAD_NETWORK("road_network"),
    MAP("map");

    private final String databaseCode;

    DatasetCode(String databaseCode) {
        this.databaseCode = databaseCode;
    }

    public String databaseCode() {
        return databaseCode;
    }
}
