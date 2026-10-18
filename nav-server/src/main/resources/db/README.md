# Database migrations

`db/migration` 是数据库结构的唯一权威来源，由 Flyway 按版本顺序执行。

## 版本划分

- `V1`：启用 PostGIS 与 pgRouting。
- `V2`：创建路网和 POI 表、约束及索引。
- `V3`：创建地图图层与地图要素表。
- `V4`：创建数据集版本表和事务化递增函数。
- `V5`：初始化地图图层元数据。
- `V6`：创建局部瓦片、MVT 和 GeoJSON 导入函数。
- `V7`：清理旧数据库中的重复空间索引。
- `V8`：为 baseline 旧库补齐地图缩放范围约束。

## 现有数据库

当前开发库是在 Flyway 引入前手工创建的，已经完成一次 V5 baseline。另一套同结构
旧库首次接入时，需要临时设置：

```properties
FLYWAY_BASELINE_ON_MIGRATE=true
```

首次启动会把既有结构记录为 V5，然后执行兼容的 V6～V8。成功后应删除这个环境
变量。默认值为 `false`，防止错误地接纳结构未知的非空数据库。全新空库不需要开启
baseline，会从 V1 执行全部迁移。

## 数据和结构的边界

Flyway 管理扩展、表、约束、索引、函数和少量稳定元数据，不管理 6225 条 POI、
945 条道路等业务数据。业务数据应通过独立导入任务或数据库备份恢复。

手工或批量写数据时，必须在同一个事务中递增对应数据集版本：

```sql
BEGIN;
-- INSERT / UPDATE / DELETE ...
SELECT public.bump_dataset_revision('poi');
COMMIT;
```

`import_local_geojson()` 已经自动递增 `map` 数据集版本。

## 旧脚本

`db/create_*.sql` 是引入 Flyway 前的手工脚本，仅保留作历史参考；不要再把它们
用于新环境初始化，也不要修改已经成功执行过的 Flyway migration。
