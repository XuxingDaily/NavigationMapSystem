import axios, { AxiosResponse } from "axios";
import * as loong from "../src/index";

/**
 * 关键字模糊查询POI
 * @param keyword 关键字
 * @param callback 回调函数callback(data)
 */
export function searchPOI(keyword: string, callback: Function) {
    axios.get('/search-poi', {
        params: {
            keyword: keyword
        }
    })
        .then(function (response) {
            const data = response.data;
            callback(data);
        })
        .catch(function (error) {
            console.error(error);
        });
}

/**
 * 以搜索框的下拉框的形式放置结果
 * @param resultsElement 放置结果的搜索框
 * @param data 返回的数据（数组）
 */
export function populateResults(resultsElement: HTMLElement, data: any) {
    resultsElement.innerHTML = '';
    data.forEach(function (poi: any) {
        const option = document.createElement('option');
        option.innerText = poi.name;
        resultsElement.appendChild(option);
    });
}

/**
 * 发送get请求
 * @param url url字符串
 * @param params 参数对象
 * @returns 
 */
export async function sendRequest(url: string, params: any): Promise<any> {
    try {
        const response: AxiosResponse = await axios.get(url, { params });
        return response.data;
    } catch (error: any) {
        // 处理请求发生的错误
        throw error;
    }
}

export function debounce(func: Function, delay: number) {
    let timer: any;
    return function (...args: any[]) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export async function remove(map: loong.Map) {
    if (map.getLayerByName("最短路径")) {
        map.removeLayerByName("最短路径");
    }
    if (map.getLayerByName("起始点")) {
        map.removeLayerByName("起始点");
    }
    if (map.getLayerByName("终点")) {
        map.removeLayerByName("终点");
    }
    if (map.getLayerByName("公交站点")) {
        map.removeLayerByName("公交站点");
    }
    if (map.getLayerByName("中转点")) {
        map.removeLayerByName("中转点");
    }
}

export async function showDriveCarPath(map: loong.Map, start: any, end: any, line: any) {
    // res 为最短路径的geojson
    const road = await loong.createElementByObj({
        name: "最短路径",
        type: loong.GeometryType.Polyline,
        data: line,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Polyline,
            new loong.LineDashSymbol(8, "#45ff0d")
        )
    });
    map.pushLayer(road);

    const startPoint = await loong.createElementByObj({
        name: "起始点",
        type: loong.GeometryType.Point,
        data: start,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Point,
            // await loong.SimpleMarkerSymbol.create(
            //     new URL("./static/marker.svg", import.meta.url),
            //     30, 30
            // )
            new loong.LetterSymbol({
                lineWidth: 0.2,
                letter: "始",
                fontColor: "#000000",
                strokeStyle: "#ffca28",
                fillStyle: "#ffca28",
                radius: 12,
                fontFamily: "楷体",
                fontSize: 12
            })
        )
    })
    map.pushLayer(startPoint);
    const endPoint = await loong.createElementByObj({
        name: "终点",
        type: loong.GeometryType.Point,
        data: end,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Point,
            // new loong.LetterSymbol({
            //     lineWidth: 0.2,
            //     letter: "终",
            //     fontColor: "#000000",
            //     fillStyle: "#ffffff",
            //     radius: 15,
            //     fontSize: 16,
            //     fontFamily: "微软雅黑"
            // })
            await loong.SimpleMarkerSymbol.create(
                new URL("./static/img/marker.svg", import.meta.url),
                30, 30
            )
        )
    })
    map.pushLayer(endPoint);
}

export async function showBusRoad(map: loong.Map, start: any, end: any, line: any, bus_station: any, turn_line: any) {
    const road = await loong.createElementByObj({
        name: "最短路径",
        type: loong.GeometryType.Polyline,
        data: line,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Polyline,
            new loong.LineDashSymbol(8, "#1677d2")
        )
    });

    const startPoint = await loong.createElementByObj({
        name: "起始点",
        type: loong.GeometryType.Point,
        data: start,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Point,
            // await loong.SimpleMarkerSymbol.create(
            //     new URL("./static/marker.svg", import.meta.url),
            //     30, 30
            // )
            new loong.LetterSymbol({
                lineWidth: 0.2,
                letter: "S",
                fontColor: "#000000",
                strokeStyle: "#ffca28",
                fillStyle: "#ffca28",
                radius: 12,
                fontFamily: "微软雅黑",
                fontSize: 16
            })
        )
    });

    const endPoint = await loong.createElementByObj({
        name: "终点",
        type: loong.GeometryType.Point,
        data: end,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Point,
            // new loong.LetterSymbol({
            //     lineWidth: 0.2,
            //     letter: "终",
            //     fontColor: "#000000",
            //     fillStyle: "#ffffff",
            //     radius: 15,
            //     fontSize: 16,
            //     fontFamily: "微软雅黑"
            // })
            await loong.SimpleMarkerSymbol.create(
                new URL("./static/img/marker.svg", import.meta.url),
                30, 30
            )
        )
    });

    const points = await loong.createElementByObj({
        type: loong.GeometryType.MultiPoint,
        data: bus_station,
        name: "公交站点",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.MultiPoint,
            new loong.PointSymbol(1, "#000000", "#ffffff", 6)
        )
    });

    const coords = turn_line.map((p: any) => {
        return [p.x, p.y];
    });
    const turn_point_data: any = {
        type: "FeatureColletion",
        features: [
            {
                type: "Feature",
                properties: turn_line,
                geometry: {
                    type: "MultiPoint",
                    coordinates: coords
                }
            }
        ]
    };

    // 中转点
    const turn_point = await loong.createElementByObj({
        data: turn_point_data,
        type: loong.GeometryType.Point,
        name: "中转点",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Point,
            new loong.LetterSymbol({
                lineWidth: 0.2,
                letter: "转",
                fontColor: "#000000",
                strokeStyle: "#8bc34a",
                fillStyle: "#8bc34a",
                radius: 12,
                fontFamily: "微软雅黑",
                fontSize: 16
            })
        )
    });

    map.pushLayer(road);
    map.pushLayer(points);
    map.pushLayer(endPoint);
    map.pushLayer(startPoint);
    // map.pushLayer(turn_point);
}

export async function initMap(map: loong.Map) {
    // 地图加载
    const road_fl = await loong.createElementByURL({
        url: new URL("./static/map/line.geojson", import.meta.url),
        type: loong.GeometryType.Polyline,
        name: "路网数据",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Polyline,
            new loong.LineSymbol(3, "#ffebbe")
        )
    });

    const bound1_fl = await loong.createElementByURL({
        url: new URL("./static/map/PARK2.geojson", import.meta.url),
        type: loong.GeometryType.Polygon,
        name: "边界1",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Polygon,
            new loong.FillSymbol(0.4, "#f0e9e2", "#f0e9e2")
        )
    });

    const bound_fl = await loong.createElementByURL({
        url: new URL("./static/map/bound.geojson", import.meta.url),
        type: loong.GeometryType.Polygon,
        name: "边界",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Polygon,
            new loong.FillSymbol(2, "#d2e6bf", "#d2e6bf")
        )
    });

    const water_fl = await loong.createElementByURL({
        url: new URL("./static/map/water.geojson", import.meta.url),
        type: loong.GeometryType.MultiPolygon,
        name: "水面",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.MultiPolygon,
            new loong.FillSymbol(1, "#d2e6bf", "#d2e6bf")
        )
    });

    const water1_fl = await loong.createElementByURL({
        url: new URL("./static/map/water1.geojson", import.meta.url),
        type: loong.GeometryType.MultiPolygon,
        name: "水面",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.MultiPolygon,
            new loong.FillSymbol(2, "#76cff0", "#76cff0")
        )
    });

    const highway_fl = await loong.createElementByURL({
        url: new URL("./static/map/highway.geojson", import.meta.url),
        type: loong.GeometryType.MultiPolyline,
        name: "高速公路",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.MultiPolyline,
            new loong.LineSymbol(3, "#c95159")
        )
    });

    const shq_fl = await loong.createElementByURL({
        url: new URL("./static/map/shq.geojson", import.meta.url),
        type: loong.GeometryType.MultiPolygon,
        name: "生活区",
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.MultiPolygon,
            new loong.FillSymbol(3, "#f1ebd6", "#f1ebd6")
        )
    });

    const jxq_fl = await loong.createElementByURL({
        url: new URL("./static/map/studyArea.geojson", import.meta.url),
        name: "教学区",
        type: loong.GeometryType.Polygon,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Polygon,
            new loong.FillSymbol(1, "#cfd3da", "#cfd3da")
        )
    });

    const schoolName = await loong.createElementByURL({
        url: new URL("./static/map/school_name.geojson", import.meta.url),
        name: "区域",
        type: loong.GeometryType.Polygon,
        renderer: new loong.SimpleRenderer(
            loong.GeometryType.Polygon,
            new loong.FillSymbol(0.1, "rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0)")
        )
    });

    schoolName.labeled = true;
    const symbol = new loong.SimpleTextSymbol();
    symbol.auto = true;
    symbol.strokeStyle = "rgba(255, 0, 0, 0)";
    symbol.fillStyle = "rgba(255, 0, 0, 0)";
    symbol.fontColor = "#000000";
    symbol.fontSize = 15;
    schoolName.label = new loong.Label({
        field: new loong.Field("name"),
        collision: new loong.SimpleCollision(),
        symbol: symbol
    });

    road_fl.minZoom = 2;
    highway_fl.minZoom = 2;
    bound1_fl.minZoom = 2;
    shq_fl.minZoom = 3;
    jxq_fl.minZoom = 2;

    map.pushLayer(bound1_fl);
    map.pushLayer(bound_fl);
    map.pushLayer(water_fl);
    map.pushLayer(water1_fl);
    map.pushLayer(shq_fl);
    map.pushLayer(jxq_fl);
    map.pushLayer(highway_fl);
    map.pushLayer(schoolName);
    map.pushLayer(road_fl);
}