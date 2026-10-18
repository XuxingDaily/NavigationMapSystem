package zhaolong.dai.nav.version.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import zhaolong.dai.nav.version.DatasetCode;
import zhaolong.dai.nav.version.mapper.DatasetRevisionMapper;
import zhaolong.dai.nav.version.service.DatasetRevisionService;

@Service
@RequiredArgsConstructor
public class DatasetRevisionServiceImpl implements DatasetRevisionService {

    private final DatasetRevisionMapper datasetRevisionMapper;

    @Override
    @Transactional(readOnly = true)
    public long current(DatasetCode datasetCode) {
        Long revision = datasetRevisionMapper.selectCurrent(
                datasetCode.databaseCode()
        );
        return requireRevision(datasetCode, revision);
    }

    /**
     * MANDATORY 禁止脱离业务写事务单独递增版本，否则可能出现版本已经变化、
     * 业务数据却未成功提交的双写不一致。
     */
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public long incrementAndGet(DatasetCode datasetCode) {
        Long revision = datasetRevisionMapper.incrementAndGet(
                datasetCode.databaseCode()
        );
        return requireRevision(datasetCode, revision);
    }

    private long requireRevision(
            DatasetCode datasetCode,
            Long revision
    ) {
        if (revision == null || revision < 1) {
            throw new IllegalStateException(
                    "数据集版本未初始化：" + datasetCode.databaseCode()
            );
        }
        return revision;
    }
}
