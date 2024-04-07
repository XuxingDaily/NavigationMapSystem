/**
 * 将数据转为单个点的标准geojson形式
 * @param {number} x 
 * @param {number} y 
 * @returns 
 */
function convertToGeoJSON_P(x, y) {
    return {
        type: "FeatureColletion",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [x, y]
                }
            }
        ]
    };
}

/**
 * 转换为标准的线类型geojson形式
 * @param {Object} data geojson
 * @returns 
 */
function convertToGeoJSON_L(data) {
    return {
        type: "FeatureColletion",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: data
                }
            }
        ]
    };
}


/**
 * 展平数组
 * @param arr 多维数组 
 * @returns 
 */
function flattenArray(arr) {
    return arr.reduce((flatArr, subArr) => {
        return flatArr.concat(subArr);
    }, []);
}

/**
 * 构建最小堆
 * @param {Array<{ point: Object{x: number, y: number}, dist: number }>} arr 距离数组
 */
function buildHeap(arr) {
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
}

/**
 * 调整最小堆
 * @param {Array<{ point: Object{x: number, y: number}, dist: number }>} arr 距离数组
 * @param {number} n 数组长度
 * @param {number} i 当前节点索引
 */
function heapify(arr, n, i) {
    let smallest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && arr[left].dist < arr[smallest].dist) {
        smallest = left;
    }

    if (right < n && arr[right].dist < arr[smallest].dist) {
        smallest = right;
    }

    if (smallest !== i) {
        swap(arr, i, smallest);
        heapify(arr, n, smallest);
    }
}

/**
 * 求平面两点距离
 * @param {Object{x: number, y: number}} pointA 
 * @param {Object{x: number, y: number}} pointB 
 */
function distance(pointA, pointB) {
    if (!pointA || !pointB) {
        console.log("distance中参数为空");
        return;
    }
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 交换数组中的两个元素
 * @param {Array<any>} arr 数组
 * @param {number} i 索引1
 * @param {number} j 索引2
 */
function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

/**
 * 从最小堆中提取最小值（即最小距离点）
 * @param {Array<{ point: Object{x: number, y: number}, dist: number }>} arr 距离数组
 * @return {{ point: Object{x: number, y: number}, dist: number }} 最小距离点
 */
function extractMin(arr) {
    const min = arr[0];
    arr[0] = arr[arr.length - 1];
    arr.pop();
    heapify(arr, arr.length, 0);
    return min;
}

/**
 * 根据名称获取离该poi最近的点
 * @param {Object{x: number, y: number}} poiCoord POI坐标
 * @param {Array<Object{x: number, y: number}>} points 所有点的数组
 * @param {number} k 距离最近的点的数量
 * @return {Array<Object{x: number, y: number}>} 最近的点的数组
 */
function getNearestPoints(poiCoord, points, k) {
    const distances = [];

    for (const point of points) {
        const pointCoord = { x: point.x, y: point.y };
        const dist = distance(poiCoord, pointCoord);
        distances.push({ point, dist });
    }

    // 使用堆排序对距离进行排序
    buildHeap(distances);
    const nearestPoints = [];

    for (let i = 0; i < k; i++) {
        const { point } = extractMin(distances);
        nearestPoints.push(point);
    }

    return nearestPoints;
}

module.exports = {
    convertToGeoJSON_P,
    flattenArray,
    convertToGeoJSON_L,
    getNearestPoints
};
