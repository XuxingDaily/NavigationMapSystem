package zhaolong.dai.nav.cache;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import zhaolong.dai.nav.vo.poi.PoiVO;

/**
 * POI 详情缓存。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PoiDetailCache {

    /**
     * hit=true 且 value=null 表示已缓存“该 POI 不存在”。
     */
    public record LookupResult(boolean hit, PoiVO value) {

        public static LookupResult miss() {
            return new LookupResult(false, null);
        }

        public static LookupResult hit(PoiVO value) {
            return new LookupResult(true, value);
        }

    }

    private final RedisTemplate<String, byte[]> binaryRedisTemplate;
    private final CacheKeyFactory cacheKeyFactory;
    private final CacheProperties cacheProperties;
    private final ObjectMapper objectMapper;

    public LookupResult get(long dataVersion, long poiId) {
        String key = cacheKeyFactory.poiDetail(dataVersion, poiId);
        try {
            byte[] value = binaryRedisTemplate.opsForValue().get(key);
            if (value == null) {
                return LookupResult.miss();
            }
            if (value.length == 0) {
                return LookupResult.hit(null);
            }
            return LookupResult.hit(
                    objectMapper.readValue(value, PoiVO.class)
            );
        } catch (DataAccessException | JacksonException exception) {
            log.warn("读取 POI 详情缓存失败：{}", key, exception);
            return LookupResult.miss();
        }
    }

    public void put(long dataVersion, PoiVO poi) {
        String key = cacheKeyFactory.poiDetail(
                dataVersion,
                poi.getId()
        );
        try {
            binaryRedisTemplate.opsForValue().set(
                    key,
                    objectMapper.writeValueAsBytes(poi),
                    cacheProperties.getPoiDetailTtl()
            );
        } catch (DataAccessException | JacksonException exception) {
            log.warn("写入 POI 详情缓存失败：{}", key, exception);
        }
    }

    /**
     * 短时间缓存不存在的 ID，防止同一非法 ID 反复穿透到数据库。
     */
    public void putNotFound(long dataVersion, long poiId) {
        String key = cacheKeyFactory.poiDetail(dataVersion, poiId);
        try {
            binaryRedisTemplate.opsForValue().set(
                    key,
                    new byte[0],
                    cacheProperties.getPoiNullTtl()
            );
        } catch (DataAccessException exception) {
            log.warn("写入 POI 空值缓存失败：{}", key, exception);
        }
    }
}
