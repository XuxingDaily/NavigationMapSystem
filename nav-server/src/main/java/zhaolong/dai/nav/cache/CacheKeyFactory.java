package zhaolong.dai.nav.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CacheKeyFactory {

    private final CacheProperties properties;

    public String poiDetail(long dataRevision, long poiId) {
        return prefix()
                + ":poi:detail:cs" + cacheSchemaVersion()
                + ":ds" + dataRevision
                + ":" + poiId;
    }

    public String poiCell(long dataRevision, int z, int x, int y) {
        return prefix()
                + ":poi:cell:cs" + cacheSchemaVersion()
                + ":ds" + dataRevision
                + ":z" + z
                + ":" + x
                + ":" + y;
    }

    public String vectorTile(String tileset, long dataRevision, int z, int x, int y) {
        // example: nav:mvt:base:cs1:ds3:5:16:12
        return prefix()
                + ":mvt:"
                + tileset
                + ":cs" + cacheSchemaVersion()
                + ":ds" + dataRevision
                + ":" + z
                + ":" + x
                + ":" + y;
    }

    private int cacheSchemaVersion() {
        int version = properties.getCacheSchemaVersion();
        if (version < 1) {
            throw new IllegalStateException("缓存结构版本必须大于等于 1");
        }
        return version;
    }

    private String prefix() {
        return properties.getKeyPrefix();
    }

}
