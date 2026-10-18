package zhaolong.dai.nav.cache;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@Data
@ConfigurationProperties(prefix = "nav.cache")
public class CacheProperties {

    private String keyPrefix = "nav";

    /**
     * Redis Value 的结构版本。缓存对象字段或序列化格式发生不兼容变化时递增。
     * 它不同于数据库中的数据集版本。
     */
    private int cacheSchemaVersion = 1;

    private Duration poiDetailTtl = Duration.ofMinutes(30);

    private Duration poiNullTtl = Duration.ofMinutes(2);

    private Duration poiQueryTtl = Duration.ofMinutes(5);

    /**
     * POI 空间网格缓存时间。
     */
    private Duration poiSpatialTtl = Duration.ofHours(1);

    /**
     * POI 空间缓存使用的固定局部金字塔层级。
     * z=4 时全局 8192 范围被划分为 16×16 个 512 单位网格。
     */
    private int poiSpatialZoom = 4;

    private Duration vectorTileTtl = Duration.ofDays(7);

    private Duration roadSnapTtl = Duration.ofMinutes(15);

    private Duration routeTtl = Duration.ofMinutes(20);

    private Duration matrixTtl = Duration.ofMinutes(10);

    /**
     * TTL 随机抖动比例。
     * 0.1 表示在基础 TTL 上增加 0～10% 的随机时间。
     */
    private double jitterRatio = 0.1;

}
