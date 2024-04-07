const model = require('./model.js');
const { 
    convertToGeoJSON_P, 
    flattenArray, 
    convertToGeoJSON_L, 
    getNearestPoints
} = require("./util.js");
const path = require("path");

/**
 * 发送Index页面
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getIndexHTML = (req, res) => res.sendFile(path.join(__dirname, './dist/index.html'))

/**
 * 模糊查询poi
 * @param req 
 * @param res 
 * @returns 
 */
async function searchPOI(req, res) {
    if (!req.query) {
        return;
    }
    const keyword = req.query.keyword;
    const data = await model.findPOIByName(keyword);
    if (!data) {
        return;
    }
    res.send(data);
}

/**
 * 网络结构
 * class Node {
 *      next_node_id;
 *      line_id;
 *      distance;
 *      road;   // 公交车网络独有，用于对BFS加入权重
 * };
 * 网络采用键值对对象
 * class Graph {
 *      <node_id, Node[]>
 *      ...
 * };
 */

/**
 * 建立网络
 * @param {Array<number>} startPoints 起始点编号数组
 * @param {Array<number>} endPoints 终点编号数组
 * @param {Array<Object>} connections 连接数组
 * @returns 
 */
async function buildGraph_car() {
    // 获取线路网络
    const connections = await model.loadConnections();

    const graph = {};
    for (const connection of connections) {
        let { startnum, endnum, linenum, Shape_Leng } = connection;
        Shape_Leng = parseFloat(Shape_Leng);
        if (!graph[startnum]) {
            graph[startnum] = [];
        }
        const node = { next_node_id: endnum, line_id: linenum, distance: Shape_Leng };
        graph[startnum].push(node);
    }

    return graph;
}

async function buildGraph_bus() {
    const connections = await model.loadBusStation();

    const graph = {};
    for (const connection of connections) {
        let { prev_bus_stop_id, bus_stop_id, FID, distance, road_name } = connection;
        distance = parseFloat(distance);
        if (!graph[prev_bus_stop_id]) {
            graph[prev_bus_stop_id] = [];
        }
        const node =  { next_node_id: bus_stop_id, line_id: FID, distance: distance, road: road_name };
        graph[prev_bus_stop_id].push(node);
    }

    return graph;
}

/**
 * 最短路径算法
 * @param {Object} graph 
 * @param {number} start 起始点编号
 * @param {number} end 终点编号
 * @returns {Object{distance: number, path: number[]}}
 */
function dijkstra(graph, start, end) {
    // 初始化阶段
    const distances = {}; // 起点到各点的距离
    const visited = {}; // 记录已访问过的节点
    const previous = {}; // 记录最短路径中的前一个节点
    const shortestPath = []; // 最短路径

    // 初始化距离和前一个节点
    for (const vertex in graph) {
        distances[vertex] = Infinity;
        previous[vertex] = null;
    }

    distances[start] = 0; // 起点到起点的距离为 0

    // 找到终点后，按照previous记录选择最短路径的辅助函数
    function getShortestPath() {
        let current = end;
        while (previous[current]) {
            shortestPath.unshift(previous[current].line_id);// 最短路径的线id放置
            current = previous[current].node;   // 向前追溯
        }
    }

    // 添加node到集合后需要更新距离和前一个节点
    function updateDistanceAndPrevious(node) {
        const neighbors = graph[node];// node的邻接边
        for (const neighbor of neighbors) {
            const { next_node_id, line_id, distance } = neighbor;
            const totalDistance = distances[node] + distance;
            if (totalDistance < distances[next_node_id]) {
                distances[next_node_id] = totalDistance;
                previous[next_node_id] = { node, line_id };
            }
        }
    }

    // 选择最短路径来加入集合
    function selectShortestPath() {
        let shortestDistance = Infinity;
        let shortestNode = null;
        for (const node in distances) {
            if (!visited[node] && distances[node] < shortestDistance) {
                shortestDistance = distances[node];
                shortestNode = node;
            }
        }
        return shortestNode;
    }

    // 执行迪杰斯特拉算法
    let currentNode = start;
    while (currentNode) {
        visited[currentNode] = true;
        if (currentNode === end) {
            getShortestPath();
            break;
        }
        updateDistanceAndPrevious(currentNode);
        currentNode = selectShortestPath();
    }

    return {
        distance: distances[end],
        path: shortestPath
    };
}

/**
 * 使用广度优先搜索算法来找到一条道路，尽可能保持相同的road_name。
 * @param {Graph} graph - 图的数据结构，包含节点和它们的邻居。
 * @param {number} startNodeId - 开始搜索的节点ID。
 * @param {number} targetNodeId - 目标节点ID。
 * @returns {Object|null} - 包含距离和路径的对象，如果没有找到路径则为null。
 */
function bfs(graph, startNodeId, targetNodeId) {
    let queue = [{ nodeId: startNodeId, path: [], distanceSum: 0, lastRoadName: null }];
    let visited = new Set();

    while (queue.length > 0) {
        let current = queue.shift();

        let currentNodeId = current.nodeId;
        let currentPath = current.path;
        let currentDistanceSum = current.distanceSum;
        let currentLastRoadName = current.lastRoadName;

        // 如果达到目标节点，返回结果
        if (currentNodeId === targetNodeId) {
            return { path: currentPath, distanceSum: currentDistanceSum };
        }

        // 标记当前节点为已访问
        visited.add(currentNodeId);

        let neighbors = graph[currentNodeId] || [];
        
        // 优先考虑与上一条道路同名的邻居
        neighbors = neighbors.sort((a, b) => {
            if (a.road === currentLastRoadName) return -1;
            if (b.road === currentLastRoadName) return 1;
            return 0;
        });

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.next_node_id)) {
                let newPath = [...currentPath, neighbor.line_id];
                let newDistanceSum = currentDistanceSum + neighbor.distance;

                // 为下一个节点准备的road
                let nextRoadName = neighbor.road === currentLastRoadName ? currentLastRoadName : neighbor.road;

                queue.push({
                    nodeId: neighbor.next_node_id,
                    path: newPath,
                    distanceSum: newDistanceSum,
                    lastRoadName: nextRoadName
                });
            }
        }
    }

    return null; // 如果没有找到路径
}

function optimizedBFS(graph, startNodeId, targetNodeId) {
    let queue = [{ nodeId: startNodeId, path: [], distanceSum: 0, lastRoadName: null }];
    let visited = new Set([startNodeId]);

    while (queue.length > 0) {
        let current = queue.shift();

        if (current.nodeId === targetNodeId) {
            return { path: current.path, distanceSum: current.distanceSum };
        }

        let neighbors = graph[current.nodeId] || [];

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.next_node_id)) {
                visited.add(neighbor.next_node_id); // Mark as visited when it's added to the queue

                let newPath = [...current.path, neighbor.line_id];
                let newDistanceSum = current.distanceSum + neighbor.distance;
                let nextRoadName = neighbor.road;

                // Priority to neighbors with the same road name
                if (nextRoadName === current.lastRoadName || current.lastRoadName === null) {
                    queue.unshift({ // Add to the front of the queue
                        nodeId: neighbor.next_node_id,
                        path: newPath,
                        distanceSum: newDistanceSum,
                        lastRoadName: nextRoadName
                    });
                } else {
                    queue.push({ // Add to the end of the queue
                        nodeId: neighbor.next_node_id,
                        path: newPath,
                        distanceSum: newDistanceSum,
                        lastRoadName: nextRoadName
                    });
                }
            }
        }
    }

    return null; // If no path is found
}

/**
 * 最短路径算法的封装实现
 * @param {number} start 开始点编号
 * @param {number} end 终点编号
 * @returns 
 */
async function findShortestPath_car(start, end) {
    try {
        const graph = await buildGraph_car();
        const result = dijkstra(graph, start, end);
        return result;
    } catch (error) {
        throw new Error('发生错误：' + error.message);
    }
}

/**
 * 最短路径算法的封装实现
 * @param {number} start 开始点编号
 * @param {number} end 终点编号
 * @returns 
 */
async function findShortestPath_bus(start, end) {
    try {
        const graph = await buildGraph_bus();
        const result = optimizedBFS(graph, start, end);
        return result;
    } catch (error) {
        throw new Error('发生错误：' + error.message);
    }
}

/**
 * 通过最短路径的线编号取得所有的坐标
 * @param {number[]} paths 最短路径的线编号
 * @param {Object} lineData 线数据
 * @returns 
 */
function getLineCoords(paths, lineData) {
    let coords = paths.map((linenum) => {
        const line = lineData.find((line) => line.linenum === linenum);
        return line ? line.coordinates : null;
    });
    coords = coords.map(s => {
        return s.split(',').map(parseFloat);
    });
    coords = flattenArray(coords);
    const coords_new = [];
    for (let i = 0; i < coords.length - 1; i += 2) {
        const point = [coords[i], coords[i + 1]];
        coords_new.push(point);
    }
    return coords_new;
}

/**
 * 搜索最短路径
 * @param req 
 * @param res 
 * @returns 
 */
async function searchCarRoad(req, res) {
    // 加载路网节点
    const startPoints = await model.loadStartPoints();
    const endPoints = await model.loadEndPoints();
    // 获取起点POI和终点POI坐标
    const { start, end } = req.query;
    const startCoord = await model.getXYByName(start);
    const endCoord = await model.getXYByName(end);
    if (!startCoord || !endCoord || !endPoints || !startPoints) {
        res.send({
            err: "未能获取到数据"
        });
        return;
    }

    // 获取离该起点POI坐标、终点POI坐标最近的五个路网节点
    const startPoint_k = getNearestPoints(startCoord, startPoints, 5);
    const endPoint_k = getNearestPoints(endCoord, endPoints, 5);
    if (!startPoint_k || startPoint_k.length == 0 || !endPoint_k || endPoint_k.length == 0
        || !startPoint_k[0].startnum || !endPoint_k[0].endnum
    ) {
        res.send({
            err: "未能获取到数据"
        });
        return;
    }

    // 获取起点终点路网节点的最短路径，若获取失败则换一对点重新尝试
    let i = 1;
    let result = await findShortestPath_car(startPoint_k[0].startnum, endPoint_k[0].endnum);
    while (result.path.length == 0 && i < 5) {
        if (startPoint_k[i].startnum && endPoint_k[i].endnum) {
            result = await findShortestPath_car(startPoint_k[i].startnum, endPoint_k[i].endnum)
            i++;
        }
        else {
            res.send({
                err: "未能获取到数据"
            });
            return;
        }
    }

    if (!startPoint_k[i] || !startPoint_k[i].x || !endPoint_k[i] || !endPoint_k[i].y) {
        res.send({
            err: "未能获取到数据"
        });
        return;
    }

    // 得到了最短路径的line_id后，加载线数据，获取json
    const lineData = await model.loadLineJson();
    const lineCoords = getLineCoords(result.path, lineData);
    if (!lineCoords) {
        res.send({
            err: "未能获取到数据"
        });
        return;
    }

    // 结果转换为json返回
    const result_start = convertToGeoJSON_P(lineCoords[0][0], lineCoords[0][1]);
    const result_end = convertToGeoJSON_P(lineCoords[lineCoords.length - 1][0], lineCoords[lineCoords.length - 1][1]);
    const result_line = convertToGeoJSON_L(lineCoords);
    res.send(JSON.stringify({ start: result_start, end: result_end, line: result_line }));
}

async function searchBusRoad(req, res) {
    // 加载公交车数据
    const bus_data = await model.loadBusStation();

    // 获取起点和终点POI的坐标位置
    const { start, end } = req.query;
    const startCoord = await model.getXYByName(start);
    const endCoord = await model.getXYByName(end);
    if (!startCoord || !endCoord || !bus_data) {
        res.send({
            err: "未能获取到数据"
        });
        return;
    }

    // 从公交车数据集中找到起点和终点站点数据
    const startPoints = bus_data.map(obj => {
        return {
            x: obj.prev_bus_stop_x,
            y: obj.prev_bus_stop_y,
            startnum: obj.prev_bus_stop_id
        };
    });
    const endPoints = bus_data.map(obj => {
        return {
            x: obj.bus_stop_x,
            y: obj.bus_stop_y,
            endnum: obj.bus_stop_id
        };
    });

    // 使用堆排序得到最接近POI点数据的前5个路网节点
    const startPoint_k = getNearestPoints(startCoord, startPoints, 5);
    const endPoint_k = getNearestPoints(endCoord, endPoints, 5);
    if (!startPoint_k || startPoint_k.length == 0 || !endPoint_k || endPoint_k.length == 0
        || !startPoint_k[0].startnum || !endPoint_k[0].endnum
    ) {
        res.send({
            err: "未能获取到数据"
        });
        return;
    }

    // 使用以上得到的路网节点得到公交车路径规划
    let i = 1;
    let result = await findShortestPath_bus(startPoint_k[0].startnum, endPoint_k[0].endnum);
    while (result.path.length == 0 && i < 5) {
        if (startPoint_k[i].startnum && endPoint_k[i].endnum) {
            result = await findShortestPath_bus(startPoint_k[i].startnum, endPoint_k[i].endnum)
            i++;
        }
        else {
            res.send({
                err: "未能获取到数据"
            });
            return;
        }
    }

    if (!startPoint_k[i] || !startPoint_k[i].x || !endPoint_k[i] || !endPoint_k[i].y) {
        res.send({
            err: "未能获取到数据"
        });
        return;
    }

    // 根据公交车路径规划中的线id找到所有的途径的公交站点
    let points = result.path.map((FID) => {
        const line = bus_data.find((line) => line.FID === FID);
        return {
            name: line.prev_bus_stop,
            prev_bus_stop_x: line.prev_bus_stop_x,
            prev_bus_stop_y: line.prev_bus_stop_y,
            line_name: line.road_name
        };
    });

    // 获取geojson
    const features = [];
    points.forEach((point) => {
        features.push({
            type: "Feature",
            properties: {
                name: point.name,
                line_name: point.line_name,
                x: point.prev_bus_stop_x,
                y: point.prev_bus_stop_y
            },
            geometry: {
                type: "Point",
                coordinates: [
                    point.prev_bus_stop_x,
                    point.prev_bus_stop_y
                ]
            }
        });
    });
    const station_point = {
        type: "FeatureColletion",
        features: features
    };

    // 判断换站点
    const lines = [];
    for (const station of points) {
        if (lines.length === 0) {
            // 若lines为空则直接放入该公交线的起始点
            lines.push({
                name: station.line_name,
                station: station.name,
                x: station.prev_bus_stop_x,
                y: station.prev_bus_stop_y
            });
        } else {
            // 若lines不为空，则判断该公交线是否出现过
            if (!lines.find((line) => line.name === station.line_name)) {
                // 每条公交线只放置第一个点
                lines.push({
                    name: station.line_name,
                    station: station.name,
                    x: station.prev_bus_stop_x,
                    y: station.prev_bus_stop_y
                });
            }
        }
    }
    lines.shift();

    // 获取途径的公交线的线数据，转为json
    let coords = result.path.map((lineid) => {
        const line = bus_data.find((line) => line.FID === lineid);
        return line ? line.coordinates : null;
    });

    // 预处理步骤
    const coords_new = [];
    for (const line of coords) {
        const line_coords = line.split(",");
        for (const coord of line_coords) {
            const c = coord.split(",").map(parseFloat);
            coords_new.push(...c);
        }
    }

    let coords_new1 = [];
    for (let i = 0; i < coords_new.length - 2; i += 2) {
        coords_new1.push([coords_new[i], coords_new[i + 1]]);
    }

    // 输出结果
    const result_start = convertToGeoJSON_P(coords_new1[0][0], coords_new1[0][1]);
    const result_end = convertToGeoJSON_P(coords_new1[coords_new1.length - 1][0], coords_new1[coords_new1.length - 1][1]);
    const result_line = convertToGeoJSON_L(coords_new1);

    res.send(JSON.stringify({
        start: result_start,
        end: result_end,
        line: result_line,
        bus_station: station_point,
        turn_line: lines
    }));
}

module.exports = {
    getIndexHTML,
    searchPOI,
    searchCarRoad,
    searchBusRoad
};
