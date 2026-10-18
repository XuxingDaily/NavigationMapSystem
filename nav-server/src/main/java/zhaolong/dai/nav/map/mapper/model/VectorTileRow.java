package zhaolong.dai.nav.map.mapper.model;

import lombok.Data;

/**
 * 数据库返回的矢量瓦片行。
 * <p>
 * 必须使用对象包装 byte[]，避免 MyBatis 将 byte[]
 * 误认为由多条查询结果组成的数组。
 */
@Data
public class VectorTileRow {

    /**
     * MVT 二进制内容
     */
    private byte[] tile;

}
