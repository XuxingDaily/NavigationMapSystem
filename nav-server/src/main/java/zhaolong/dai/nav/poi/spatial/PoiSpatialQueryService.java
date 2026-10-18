package zhaolong.dai.nav.poi.spatial;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import zhaolong.dai.nav.cache.PoiSpatialCache;
import zhaolong.dai.nav.poi.mapper.PoiMapper;
import zhaolong.dai.nav.version.DatasetCode;
import zhaolong.dai.nav.version.service.DatasetRevisionService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 视口和附近查询共用的空间候选集服务。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PoiSpatialQueryService {

    private final Object fillLock = new Object();

    private final LocalPoiGridIndex gridIndex;
    private final PoiSpatialCache spatialCache;
    private final DatasetRevisionService datasetRevisionService;
    private final PoiMapper poiMapper;

    public List<PoiCacheItem> findCandidates(PoiSpatialBounds queryBounds) {
        // 查询 bounds 内对应的若干瓦片坐标
        List<PoiCellCoordinate> cells = gridIndex.cellsFor(queryBounds);
        if (cells.isEmpty()) {
            return List.of();
        }

        // 数据版本，用于整体淘汰缓存
        long version = datasetRevisionService.current(DatasetCode.POI);

        // Cache Aside，先查询缓存，MGET 批量查询候选 POI
        Map<PoiCellCoordinate, List<PoiCacheItem>> values = new LinkedHashMap<>(spatialCache.getAll(version, cells));

        // 考虑未命中的部分瓦片，将其合并一次查询数据库
        int redisHitCells = values.size();
        int databaseLoadedCells = 0;

        // 未几中的候选瓦片集合，合并在一起
        Set<PoiCellCoordinate> missing = missing(cells, values);
        if (!missing.isEmpty()) {
            /*
             * 页面初始化时可能并发产生多个视口查询。冷缓存填充阶段串行化，
             * 并在锁内二次读取，避免多个请求重复查询同一批空间网格。
             */
            synchronized (fillLock) {
                // Double check，防止重复建立缓存
                Map<PoiCellCoordinate, List<PoiCacheItem>> secondRead = spatialCache.getAll(version, missing);
                values.putAll(secondRead);
                redisHitCells += secondRead.size();
                missing = missing(cells, values);

                // 二次查询仍未击中的候选瓦片再去查询数据库
                if (!missing.isEmpty()) {
                    databaseLoadedCells = missing.size();
                    Map<PoiCellCoordinate, List<PoiCacheItem>> loaded = loadMissingCells(missing);
                    // 建立 Redis 缓存
                    spatialCache.putAll(version, loaded);
                    values.putAll(loaded);
                }
            }
        }

        log.debug(
                "POI spatial cache: cells={}, redisHit={}, databaseLoaded={}",
                cells.size(),
                redisHitCells,
                databaseLoadedCells
        );

        return cells.stream()
                // 取出多个缓存网格中的 POI 列表，flatMap 将其展开
                .flatMap(cell -> values
                        .getOrDefault(cell, List.of())
                        .stream())
                // 按照 POI ID 去重，
                // 用 LinkedHashMap<Long, PoiCacheItem> 进行收集
                .collect(Collectors.toMap(
                        PoiCacheItem::id,
                        Function.identity(),
                        (left, right) -> left, // Key 重复的合并策略
                        LinkedHashMap::new
                ))
                // 最终转换为 List
                .values()
                .stream()
                .toList();
    }

    private Map<PoiCellCoordinate, List<PoiCacheItem>> loadMissingCells(Set<PoiCellCoordinate> missing) {
        // 获取缺失的瓦片坐标对应的包络矩形 bounds
        PoiSpatialBounds bounds = gridIndex.coveringBounds(missing);

        Map<PoiCellCoordinate, List<PoiCacheItem>> result = new LinkedHashMap<>();
        missing.forEach(cell -> result.put(cell, new ArrayList<>()));

        // 按照 bounds 进行查询，然后按照坐标归属进行分类
        poiMapper.selectByBounds(
                        bounds.minX(),
                        bounds.minY(),
                        bounds.maxX(),
                        bounds.maxY()
                )
                .stream()
                .map(PoiCacheItem::from)
                .forEach(item -> {
                    PoiCellCoordinate cell = gridIndex.cellFor(item.x(), item.y());
                    List<PoiCacheItem> bucket = result.get(cell);
                    if (bucket != null) {
                        bucket.add(item);
                    }
                });

        return result;
    }

    /**
     * 查询 values 中未击中的 cells 中的瓦片坐标集合
     * @param cells 所有候选瓦片集合
     * @param values Redis MGET 结果
     * @return Redis MGET 结果中未击中的候选瓦片集合
     */
    private Set<PoiCellCoordinate> missing(
            List<PoiCellCoordinate> cells,
            Map<PoiCellCoordinate, List<PoiCacheItem>> values
    ) {
        return cells.stream()
                .filter(cell -> !values.containsKey(cell))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
