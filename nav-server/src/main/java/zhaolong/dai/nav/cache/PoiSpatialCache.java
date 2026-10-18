package zhaolong.dai.nav.cache;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import zhaolong.dai.nav.poi.spatial.PoiCacheItem;
import zhaolong.dai.nav.poi.spatial.PoiCellCoordinate;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * POI 固定空间网格的 Redis 读写组件。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PoiSpatialCache {

    private final RedisTemplate<String, byte[]> binaryRedisTemplate;
    private final CacheKeyFactory cacheKeyFactory;
    private final CacheProperties cacheProperties;
    private final ObjectMapper objectMapper;

    public Map<PoiCellCoordinate, List<PoiCacheItem>> getAll(
            long dataVersion,
            Collection<PoiCellCoordinate> cells
    ) {
        if (cells.isEmpty()) {
            return Map.of();
        }

        List<PoiCellCoordinate> orderedCells = new ArrayList<>(cells);
        List<String> keys = orderedCells.stream()
                .map(cell -> key(dataVersion, cell))
                .toList();

        try {
            // MGET 统一查询多个瓦片网格内的 POI 列表
            List<byte[]> values = binaryRedisTemplate.opsForValue().multiGet(keys);
            if (values == null) {
                return Map.of();
            }

            // 桶收集到各个瓦片
            Map<PoiCellCoordinate, List<PoiCacheItem>> hits = new LinkedHashMap<>();
            for (int index = 0; index < orderedCells.size(); index++) {
                byte[] value = index < values.size() ? values.get(index) : null;
                if (value != null) {
                    hits.put(orderedCells.get(index), decode(value));
                }
            }
            return hits;
        } catch (DataAccessException | JacksonException exception) {
            log.warn("读取 POI 空间缓存失败，降级为数据库查询", exception);
            return Map.of();
        }
    }

    public void putAll(
            long dataVersion,
            Map<PoiCellCoordinate, List<PoiCacheItem>> values
    ) {
        values.forEach((cell, items) -> {
            try {
                binaryRedisTemplate.opsForValue().set(
                        key(dataVersion, cell),
                        objectMapper.writeValueAsBytes(items),
                        cacheProperties.getPoiSpatialTtl()
                );
            } catch (DataAccessException | JacksonException exception) {
                log.warn(
                        "写入 POI 空间缓存失败：z={}, x={}, y={}",
                        cell.z(),
                        cell.x(),
                        cell.y(),
                        exception
                );
            }
        });
    }

    private List<PoiCacheItem> decode(byte[] value) throws JacksonException {
        JavaType type = objectMapper.getTypeFactory()
                .constructCollectionType(
                        List.class,
                        PoiCacheItem.class
                );
        return objectMapper.readValue(value, type);
    }

    private String key(long dataVersion, PoiCellCoordinate cell) {
        return cacheKeyFactory.poiCell(
                dataVersion,
                cell.z(),
                cell.x(),
                cell.y()
        );
    }
}
