# 广州大学城导航地图系统

## 项目概述

本项目旨在通过原生JavaScript和Canvas开发一个针对小谷围岛的导航地图系统，整合了各种数据来源以提供精确的导航服务。本系统包括了一个前端用户界面和一个后端服务器，以及一个数据库，用于存储和检索导航数据。
通过对GIS图形渲染算法、地图导航算法的原生实践和贯穿始终的完整的系统平台开发，可以有效锻炼提升自身的开发水平。

## 数据来源及处理

### 数据种类及获取方式

- **POI（兴趣点）**：通过高德API获取，并通过自动化爬虫技术进行数据爬取。
- **公交站点和线路**：采用网络爬虫技术，首先从8684公交网站抓取公交线路名称，然后使用这些名称通过高德API批量获取线路数据。通过pandas进行数据处理，并保存到数据库中。
- **路网数据**：直接从OpenStreetMap（OSM）平台下载，并通过GIS软件进行人工数据清洗，处理拓扑错误，统一属性标准，最终将处理后的数据导入MySQL数据库。

### 数据处理的目标

处理过程的目标是确保数据的准确性和可用性，以提供可靠的导航服务。通过清洗和标准化，我们确保数据在系统中保持一致，从而能够提供精确的路径规划。

## 系统设计

本导航系统采用前后端分离的架构，前端提供用户界面，后端负责数据处理和服务逻辑。

### 前端设计

- **技术选型**：前端使用HTML、CSS、TypeScript进行开发，保证跨平台的兼容性和响应式设计。
- **GIS渲染**：使用自研的GIS可视化库支持矢量渲染。
- **工程化处理**：引入webpack作为打包工具，优化资源加载和应用性能。

### 后端设计

- **技术框架**：后端基于Node.js的Express框架，实现RESTful API设计。
- **架构模式**：后端服务采用类MVC的模式，分离数据层、控制层和视图层（API响应），便于代码管理和功能扩展。

### 数据库设计

- **自驾导航数据模型**：使用图的节点和边分离表示法，以三个表格分别存储节点和边的数据，支持通过Dijkstra算法计算最短路径。
- **公交导航数据模型**：采用边为记录的图结构，一个表格存储所有线段的数据，通过BFS算法计算最少换乘路径。

## 算法选择理由

### 自驾导航

- **Dijkstra算法**：因其优秀的最短路径计算能力，在带有正权重的图结构中表现出色，非常适合用于计算基于距离成本的自驾导航路径。

### 公交导航

- **BFS算法**：适用于计算最少换乘次数的路径，满足用户快速、高效地使用公共交通工具的需求。

## 系统流程

1. **用户输入**：前端收集用户输入的起点和终点信息，并发送至后端。
2. **数据查询**：后端执行模糊查询，将可能的选项返回给前端供用户选择。
3. **路径计算**：用户选择具体POI后，后端计算路径并返回路径数据。
4. **结果渲染**：前端接收路径数据，并使用GIS可视化库展示给用户。

## 开发与使用难点

- **数据预处理**：确保数据的质量和一致性对于导航精度至关重要。
- **算法实现**：选择合适的算法并实现它们以满足不同类型导航的需求。
- **前后端开发**：构建一个易用且反应迅速的用户界面，以及一个稳定高效的后端服务。

## 地图可视化模块

本地图可视化库由多个模块组成，每个模块负责处理特定的数据和渲染任务，共同工作以提供一个完整的地图显示解决方案。这包括几何数据的处理、要素与要素集的管理、符号定义、以及多种渲染方式的实现等。

- **几何模块**：定义几何实体数据结构，如点、线、面。
- **要素模块**：对几何和属性数据的封装。
- **要素集模块**：管理要素集，包括元数据、数据类型和字段。
- **符号模块**：定义要素的视觉表示，如颜色、线宽。
- **渲染模块**：实现单一符号、分类和分段渲染。
- **要素图层模块**：结合要素集和渲染方式，形成图层。
- **瓦片地图模块**：独立地显示地图瓦片。
- **投影模块**：包括Web墨卡托投影和坐标转换。
- **包络矩形模块**：处理四至和相交检测。
- **注记模块**：管理地图文本标注，避免重叠。
- **地图模块**：地图的核心功能，包括地图初始化、视图设置、图层管理和交互功能。

需要注意的是：该系统可以渲染投影后未知坐标系的平面坐标系。

## 使用
前提：安装了node.js环境
```bash
    npm i -g nodemon
    npm run build
    npm run start
```

