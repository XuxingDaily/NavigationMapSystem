package zhaolong.dai.nav.version.service;

import zhaolong.dai.nav.version.DatasetCode;

/**
 * 数据集版本服务。
 * <p>
 * 数据库是版本的唯一权威来源。写业务必须在修改数据的同一事务中调用
 * {@link #incrementAndGet(DatasetCode)}，使数据变更和版本切换同时提交或回滚。
 */
public interface DatasetRevisionService {

    /**
     * 获取当前已提交的数据集版本。
     */
    long current(DatasetCode datasetCode);

    /**
     * 在现有写事务中递增并返回数据集版本。
     */
    long incrementAndGet(DatasetCode datasetCode);
}
