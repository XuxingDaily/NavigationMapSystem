package zhaolong.dai.nav.cache;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VectorTileCache {

    private final RedisTemplate<String, byte[]> binaryRedisTemplate;
    private final CacheKeyFactory cacheKeyFactory;
    private final CacheProperties cacheProperties;

    public byte[] get(String tileset, long dataVersion, int z, int x, int y) {
        String key = cacheKeyFactory.vectorTile(tileset, dataVersion, z, x, y);
        try {
            return binaryRedisTemplate.opsForValue().get(key);
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis connection failure", e);
            return null;
        }
    }

    public void put(String tileset, long dataVersion, int z, int x, int y, byte[] tile) {
        String key = cacheKeyFactory.vectorTile(tileset, dataVersion, z, x, y);
        try {
            binaryRedisTemplate.opsForValue().set(key, tile, cacheProperties.getVectorTileTtl());
        } catch (RedisConnectionFailureException e) {
            log.warn("Redis connection failure", e);
        }
    }

}
