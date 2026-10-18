package zhaolong.dai.nav.version.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DatasetRevisionMapper {

    Long selectCurrent(@Param("datasetCode") String datasetCode);

    Long incrementAndGet(@Param("datasetCode") String datasetCode);
}
