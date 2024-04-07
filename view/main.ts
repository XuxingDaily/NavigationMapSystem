import "./style/init.css";
import "./style/main.css";

import * as loong from "../src/index";

import { searchPOI, populateResults, sendRequest, debounce, showDriveCarPath, remove, showBusRoad, initMap } from "./utils";

async function main() {
    // 设置地图
    const map = new loong.Map({
        target: "map",
        zoom: 3,
        layers: [],
        minZoom: 1,
        maxZoom: 8
    });

    // 设置瓦片
    // map.setTile(new loong.Tiles({
    //     map: map,
    //     extent: new loong.Extent(25813, 16029, 45293, 55077),
    //     url: "./static/tiles/{z}/{x}/{y}.png",
    //     resolution: [19.109257, 9.554629, 4.777314, 2.388657, 1.194329, 0.597164]
    // }));

    initMap(map);

    // 获取搜索框和提示栏
    const startInput = document.getElementById('start-input') as HTMLInputElement;
    const endInput = document.getElementById('end-input') as HTMLInputElement;
    const startResults = document.getElementById('start-results') as HTMLDivElement;
    const endResults = document.getElementById('end-results') as HTMLDivElement;

    // 获取按钮元素和内部圆形部分元素
    const toggleButton = document.getElementById('toggleButton') as HTMLDivElement;
    const toggleButtonInner = toggleButton.querySelector('.toggle-button-inner') as HTMLDivElement;
    const toggleText = document.querySelector(".toggle-button-text") as HTMLDivElement;
    const searchButton = document.getElementById('search-button') as HTMLButtonElement;

    // 站点信息
    const station_info = document.querySelector("#station_info") as HTMLDivElement;

    // 搜索框事件监听 + 防抖 -> 发送请求获得提示词
    const searchPOIDebounced = debounce(searchPOI, 1000);
    startInput.addEventListener('focus', function () {
        if (startInput.value !== "") {
            searchPOIDebounced(startInput.value, function (data: any) {
                populateResults(startResults, data);
                startResults.style.display = "block";
            });
        }
    });
    endInput.addEventListener('focus', function () {
        if (endInput.value !== "") {
            searchPOIDebounced(endInput.value, function (data: any) {
                populateResults(endResults, data);
                endResults.style.display = "block";
            });
        }
    });

    // 提示栏事件监听 -> 防止提示词
    startResults.addEventListener("click", function (e: Event) {
        const optionElem = e.target as HTMLElement;
        startInput.value = optionElem.innerText;
    });
    endResults.addEventListener("click", function (e: Event) {
        const optionElem = e.target as HTMLElement;
        endInput.value = optionElem.innerText;
    });

    // 搜索框事件监听 -> 失去焦点，关闭提示栏
    startInput.addEventListener("blur", function (e: Event) {
        setTimeout(function () {
            startResults.style.display = "none";
        }, 100);
    });
    endInput.addEventListener("blur", function (e: Event) {
        setTimeout(function () {
            endResults.style.display = "none";
        }, 100);
    });

    // 点击按钮时切换状态
    let url = "./search-car-road";
    toggleButton.addEventListener('click', () => {
        toggleButtonInner.classList.toggle('toggle-button-on');

        if (toggleButtonInner.classList.contains('toggle-button-on')) {
            toggleText.textContent = '公交模式';
            url = "./search-bus-road"
        } else {
            toggleText.textContent = '自驾模式';
            url = "./search-car-road";
        }

    });

    // 导航定位发送请求
    searchButton.addEventListener("click", async () => {
        const startValue = startInput.value;
        const endValue = endInput.value;

        try {
            const res = await sendRequest(url, {
                start: startValue,
                end: endValue
            });

            remove(map);
            station_info.innerText = "";
            if (url === "./search-bus-road") {
                showBusRoad(map, res.start, res.end, res.line, res.bus_station, res.turn_line);
                // 展示站点信息
                let text = "站点：";
                let line_name = "";
                let station_name = "";
                for (const station of res.bus_station.features) {
                    if (line_name === station.properties.line_name) {
                        station_name = station.properties.name;
                        text += "\n\t\t'" + station.properties.name + "'"
                    } else {
                        line_name = station.properties.line_name;
                        if (station_name) text += "\n\t\t'" + station.properties.name + "'"
                        text += "\n - [" + station.properties.line_name + "]\n\t\t'" + station.properties.name + "'";
                    }
                }
                station_info.innerText = text;
                
            } else {
                showDriveCarPath(map, res.start, res.end, res.line);
            }

        } catch (err: any) {
            console.error(err);
        }
    });
};

window.onload = main;

