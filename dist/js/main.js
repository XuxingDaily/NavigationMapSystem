/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./view/style/init.css":
/*!*****************************!*\
  !*** ./view/style/init.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./view/style/main.css":
/*!*****************************!*\
  !*** ./view/style/main.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/core/Map.ts":
/*!*************************!*\
  !*** ./src/core/Map.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Map: () => (/* binding */ Map)
/* harmony export */ });
/* harmony import */ var _interaction_Interaction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./interaction/Interaction */ "./src/core/interaction/Interaction.ts");
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../index */ "./src/index.ts");



/**
 * 地图
 */
class Map {
    constructor(config) {
        /**
         * 回调函数
         * @remarks 用于存在其他对象需要和Map一起调用回调函数的时候
         */
        this._events = {
            move: [],
            extent: []
        };
        // -------------- 事件绑定 --------------- //
        /**
         * 鼠标事件的拖拽记录
         */
        this._drag = {
            flag: false,
            start: {
                x: 0,
                y: 0
            },
            end: {
                x: 0,
                y: 0
            }
        };
        // 传入参数
        this._container = document.getElementById(config.target);
        // 动态创建 canvas 调整高宽
        this._canvas = document.createElement("canvas");
        this._canvas.style.cssText = "position: absolute; height: 100vh; width: 100vw;";
        this._canvas.width = this._container.clientWidth;
        this._canvas.height = this._container.clientHeight;
        this._container.appendChild(this._canvas);
        this._ctx = this._canvas.getContext("2d");
        this._layers = config.layers ? config.layers : [];
        this._zoom = config.zoom != null ? config.zoom : 3;
        this._minZoom = config.minZoom != null ? config.minZoom : 3;
        this._maxZoom = config.maxZoom != null ? config.maxZoom : 20;
        this._layers.forEach(layer => {
            layer.minZoom = this._minZoom;
            layer.maxZoom = this._maxZoom;
        });
        // 获取图层最大Extent
        this._layerExtent = this.getLayerExtent();
        // 加载瓦片地图
        this._tile = config.tile ? config.tile : null;
        // 得到图层中心点（地理坐标）
        this._center = this.getCenter(this._layerExtent);
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        }
        else {
            this.setView(this._zoom, this._layerExtent);
        }
        // 获取此时的可视区范围（作渲染使用）
        this._viewExtent = this.getViewExtent();
        // 添加事件监听
        this._addEventListener();
    }
    get container() {
        return this._container;
    }
    get ctx() {
        return this._ctx;
    }
    set ctx(ctx) {
        this._ctx = ctx;
    }
    get center() {
        return this._center;
    }
    get zoom() {
        return this._zoom;
    }
    get minZoom() {
        return this._minZoom;
    }
    set minZoom(zoom) {
        this._minZoom = zoom;
    }
    get maxZoom() {
        return this._maxZoom;
    }
    set maxZoom(zoom) {
        this._maxZoom = zoom;
    }
    setTile(tile) {
        this._tile = tile;
        this.setView(this._zoom, tile.extent);
    }
    /**
     * 设置栅格瓦片地址
     * @param url
     */
    setTileURL(url) {
        this._tile.url = url;
        this._tile.draw();
    }
    /**
     * 获取全部图层的最大Extent
     * @returns 最大Extent
     */
    getLayerExtent() {
        const extent_top = Math.max(...(this._layers.map(layer => { return layer.extent.ymax; })));
        const extent_bottom = Math.min(...(this._layers.map(layer => { return layer.extent.ymin; })));
        const extent_left = Math.min(...(this._layers.map(layer => { return layer.extent.xmin; })));
        const extent_right = Math.max(...(this._layers.map(layer => { return layer.extent.xmax; })));
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_1__.Extent(extent_top, extent_bottom, extent_left, extent_right);
    }
    /**
     * 获取 Extent 的中心点 [x, y]
     * @param extent [x, y]
     * @returns
     */
    getCenter(extent) {
        return [(extent.xmax + extent.xmin) / 2, (extent.ymax + extent.ymin) / 2];
    }
    /**
     * 设置转换矩阵
     * @param extent 图层范围
     * @remarks 视觉中心点为 this.center
     */
    setView(zoom = this._zoom, extent) {
        this._zoom = Math.max(this._minZoom, Math.min(this._maxZoom, zoom));
        const ex = extent ? extent : this.getLayerExtent();
        const center = this.getCenter(ex);
        const a = this._canvas.height / (ex.ymax - ex.ymin) * ex.xscale, d = this._canvas.height / (ex.ymax - ex.ymin) * ex.yscale, e = this._container.clientWidth / 2 - a * center[0], f = this._canvas.clientHeight / 2 - d * center[1];
        this._ctx.setTransform(a, 0, 0, d, e, f);
        this.redraw();
        // const et = extent ? extent : this._tile.extent;
        // const center = this.getCenter(et);
        // const
        //     a = 256 * Math.pow(2, this._zoom) / (et.xmax - et.xmin) * et.xscale,
        //     d = 256 * Math.pow(2, this._zoom) / (et.ymax - et.ymin) * et.yscale,
        //     e = this._canvas.width / 2 - a * center[0] - 150,
        //     f = this._canvas.height / 2 - d * center[1] - 20;
        // this._ctx.setTransform(a, 0, 0, d, e, f);
        // this.redraw();
    }
    /**
     * 根据转换矩阵得到可视区范围
     * @return {Extent} 可视区范围
     */
    getViewExtent() {
        const matrix = this._ctx.getTransform();
        const x1 = (0 - matrix.e) / matrix.a, y1 = (0 - matrix.f) / matrix.d, x2 = (this._canvas.width - matrix.e) / matrix.a, y2 = (this._canvas.height - matrix.f) / matrix.d;
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_1__.Extent(Math.max(y1, y2), Math.min(y1, y2), Math.min(x1, x2), Math.max(x1, x2));
    }
    /**
     * 地图动态事件监听
     * @param event
     * @param handler
     */
    on(event, handler) {
        this._events[event].push(handler);
    }
    /**
     * 动态更新 ViewCenter和 ViewExtent
     * @remarks
     * 常用于事件
     */
    updataView() {
        this._layerExtent = this.getLayerExtent();
        this._viewExtent = this.getViewExtent();
        this._center = this.getCenter(this._viewExtent);
        this._events.extent.forEach((handler) => handler());
    }
    /**
     * 清除所有绘制的内容
     */
    clear() {
        // 先重置矩阵，清除绘图，后续会恢复矩阵
        this._ctx.resetTransform();
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        // this._ctx.fillStyle = '#d1dadb'; // 设置背景颜色为浅蓝色
        // this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height); // 绘制填充整个 Canvas 的矩形
    }
    /**
     * 重绘
     * @remarks
     * 常见于事件后
     */
    redraw() {
        this._ctx.save();
        this.clear();
        this._ctx.restore();
        // 更新 视觉中心 和 可视区范围
        this.updataView();
        // 绘制所有图层
        this._layers.forEach(layer => {
            layer.draw(this._ctx, this._viewExtent, this._zoom);
        });
        this._layers.filter(layer => layer instanceof _index__WEBPACK_IMPORTED_MODULE_2__.FeatureLayer && layer.labeled).forEach((layer) => {
            layer.drawLabel(this._ctx, this.getViewExtent(), this._zoom);
        });
    }
    /**
     * 获取第K个图层
     * @param K
     * @returns
     * @remarks K从1开始
     */
    getLayer(K) {
        return this._layers[K - 1];
    }
    getLayerByName(name) {
        for (const layer of this._layers) {
            if (layer.name === name) {
                return layer;
            }
        }
        return null;
    }
    removeLayerByName(name) {
        this.setView(this._zoom, this._layerExtent);
        this._layers = this._layers.filter(layer => layer.name !== name);
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        }
        else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
    }
    /**
     * 添加图层
     * @param layer 图层
     */
    pushLayer(layer) {
        this._layers.push(layer);
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        }
        else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
    }
    /**
     * 插入图层为第K个图层
     * @param K 第K个位置
     * @param layer
     * @remarks K从1开始
     */
    insertLayer(K, layer) {
        this._layers.splice(K - 1, 0, layer);
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        }
        else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
    }
    // /**
    //  * 添加图层
    //  * @param layer 图层
    //  */
    // public addLayer(layer: Layer): void {
    //     this._layers.push(layer);
    //     // 获取图层最大Extent
    //     this._layerExtent = this.getLayerExtent();
    //     // 根据图层中心点和图层Extent设置转移矩阵
    //     // 视觉中心点（Canvas中心）为图层中心点
    //     if (this._tile) {
    //         this.setView(this._zoom);
    //     } else {
    //         this.setView(this._zoom, this._layerExtent);
    //     }
    // }
    /**
     * 删除第 K 个图层
     * @param K
     * @returns 被删除图层
     * @remarks K从1开始
     */
    removeKthLayer(K) {
        const layer = this._layers.splice(K - 1, 1)[0];
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        }
        else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
        return layer;
    }
    /**
     * 删除图层
     * @param layer 图层
     * @returns 被删除图层
     */
    removeLayer(layer) {
        const index = this._layers.findIndex(item => item === layer);
        const delayer = this._layers.splice(index, 1)[0];
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        }
        else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
        return delayer;
    }
    /**
     * 置顶第K个图层
     * @param K
     * @remarks K从1开始
     */
    upLayer(K) {
        const layer = this._layers.splice(K - 1, 1)[0];
        this._layers.splice(0, 0, layer);
        this.redraw();
    }
    /**
     * 清空图层
     */
    clearLayer() {
        this._layers = [];
        this.redraw();
    }
    hiddenLayer(k) {
        this._layers[k - 1].visible = false;
        this.redraw();
    }
    showLayer(k) {
        this._layers[k - 1].visible = true;
        this.redraw();
    }
    /**
     * 统一绑定事件
     */
    _addEventListener() {
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onResize = this._onResize.bind(this);
        this._onDoubleClick = this._onDoubleClick.bind(this);
        this._canvas.addEventListener("mousedown", this._onMouseDown);
        this._canvas.addEventListener("mousemove", this._onMouseMove);
        this._canvas.addEventListener("mouseup", this._onMouseUp);
        this._canvas.addEventListener('wheel', this._onWheel);
        this._canvas.addEventListener("dblclick", this._onDoubleClick);
        window.addEventListener("resize", this._onResize);
    }
    /**
     * 鼠标下压时记录位置
     * @param event 鼠标事件
     */
    _onMouseDown(event) {
        this._drag.flag = true;
        this._drag.start.x = event.x;
        this._drag.start.y = event.y;
    }
    _onDoubleClick(event) {
        // 阻止冒泡
        event.preventDefault();
        let zoom = this._zoom + 2 >= this._maxZoom ? this._maxZoom - this._zoom : 2;
        this._zoom += zoom;
        let scale = Math.pow(2, zoom);
        this._ctx = (0,_interaction_Interaction__WEBPACK_IMPORTED_MODULE_0__.scaleGeometry)(this._ctx, {
            x: event.offsetX,
            y: event.offsetY
        }, scale);
        this.redraw();
    }
    /**
     * 鼠标移动时带动几何图形并重绘
     * @param event 鼠标事件
     */
    _onMouseMove(event) {
        if (!this._drag.flag)
            return;
        // 鼠标下压的时候记录开始位置 移动的时候不断记录最终位置并转移
        this._drag.end.x = event.x;
        this._drag.end.y = event.y;
        const matrix = this._ctx.getTransform();
        this._ctx.translate((this._drag.end.x - this._drag.start.x) / matrix.a, (this._drag.end.y - this._drag.start.y) / matrix.d);
        // 转移后该位置就是起始点
        this._drag.start.x = event.x;
        this._drag.start.y = event.y;
        this.redraw();
    }
    /**
     * 鼠标松开时不再记录
     * @param event 鼠标事件
     */
    _onMouseUp(event) {
        this._drag.flag = false;
    }
    /**
     * 滚轮事件绑定放大缩小并重绘
     * @param event 滚轮事件
     */
    _onWheel(event) {
        // 阻止冒泡
        event.preventDefault();
        // 获取放大缩小的指数
        let scale = 1;
        const sensitivity = 100;
        const delta = event.deltaY / sensitivity;
        // 获取放大缩小的倍数 放大2 缩小0.5
        delta < 0 ? scale *= delta * (-2) : scale /= delta * 2;
        let zoom = Math.round(Math.log(scale));
        if (zoom > 0) {
            // 放大
            zoom = this._zoom + zoom >= this._maxZoom ? this._maxZoom - this._zoom : zoom;
        }
        else if (zoom < 0) {
            // 缩小
            zoom = this._zoom + zoom <= this._minZoom ? this._minZoom - this._zoom : zoom;
        }
        if (zoom == 0)
            return;
        this._zoom += zoom;
        scale = Math.pow(2, zoom);
        // 通过变换矩阵进行变换
        this._ctx = (0,_interaction_Interaction__WEBPACK_IMPORTED_MODULE_0__.scaleGeometry)(this._ctx, {
            x: event.offsetX,
            y: event.offsetY
        }, scale);
        this.redraw();
    }
    /**
     * 当浏览器大小变化的时候实时更新canvas大小
     */
    _onResize() {
        this._canvas.width = this._container.clientWidth;
        this._canvas.height = this._container.clientHeight;
        if (this._tile) {
            this.setView(this._zoom);
        }
        else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
    }
}


/***/ }),

/***/ "./src/core/element/Feature.ts":
/*!*************************************!*\
  !*** ./src/core/element/Feature.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Feature: () => (/* binding */ Feature)
/* harmony export */ });
/* harmony import */ var _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/symbol/FillSymbol */ "./src/core/render/symbol/FillSymbol.ts");
/* harmony import */ var _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/symbol/LineSymbol */ "./src/core/render/symbol/LineSymbol.ts");
/* harmony import */ var _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../render/symbol/PointSymbol */ "./src/core/render/symbol/PointSymbol.ts");
/* harmony import */ var _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../geometry/Geometry */ "./src/core/geometry/Geometry.ts");
/* harmony import */ var _render_symbol_Symbol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../render/symbol/Symbol */ "./src/core/render/symbol/Symbol.ts");





/**
 * 要素
 */
class Feature {
    constructor(geometry, properties) {
        // 放入geometry
        this._geometry = geometry;
        // 按顺序放入属性
        this._properties = properties;
        // 默认下可视
        this.visible = true;
        // 默认下不开启高亮
        this.isHeightLighted = false;
    }
    get text() {
        return this._text;
    }
    set text(t) {
        this._text = t;
    }
    /**
     * 要素几何图形
     */
    get geometry() {
        return this._geometry;
    }
    /**
     * 要素属性
     */
    get properties() {
        return this._properties;
    }
    /**
     * 要素几何图形包络矩形
     */
    get extent() {
        return this._geometry ? this._geometry.getExtent() : null;
    }
    /**
     * 标注要素
     * @remarks 调用空间坐标信息进行标注绘制
     * @param {Field} field - 标注字段
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @param {SimpleTextSymbol} symbol - 标注符号
     */
    label(field, ctx, symbol = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__.SimpleTextSymbol()) {
        if (this.visible)
            this._geometry.label(this._properties[field.name], ctx, this._text ? this._text : symbol);
    }
    /**
     * 绘制几何图形
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     * @param symbol 几何图形符号
     */
    draw(ctx, extent, symbol) {
        if (this.visible) {
            if (this.isHeightLighted) {
                let heightLightSymbol = new _render_symbol_Symbol__WEBPACK_IMPORTED_MODULE_4__.Symbol(1, "#1286d3", "#88deff");
                switch (this._geometry.type) {
                    case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.Point || _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.MultiPoint:
                        heightLightSymbol = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__.PointSymbol(1, "#1286d3", "#88deff");
                        break;
                    case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.Polyline || _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.MultiPolyline:
                        heightLightSymbol = new _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_1__.LineSymbol(1, "#1286d3");
                        break;
                    case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.Polygon || _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.MultiPolygon:
                        heightLightSymbol = new _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(1, "#1286d3", "#88deff");
                        break;
                    case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.MultiPoint:
                        heightLightSymbol = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__.PointSymbol(1, "#1286d3", "#88deff", this._geometry._symbol.radius);
                        break;
                    case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.MultiPolyline:
                        heightLightSymbol = new _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_1__.LineSymbol(1, "#1286d3");
                        break;
                    case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_3__.GeometryType.MultiPolygon:
                        heightLightSymbol = new _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(1, "#1286d3", "#88deff");
                        break;
                    default:
                        break;
                }
                this._geometry.draw(ctx, extent, heightLightSymbol);
            }
            else {
                this._geometry.draw(ctx, extent, symbol);
            }
        }
    }
    /**
     * 判断要素与可视区范围是否交叉
     * @param extent 可视区范围
     * @returns
     */
    intersect(extent) {
        if (this.visible)
            return this._geometry.getExtent().intersect(extent);
        else
            return false;
    }
}


/***/ }),

/***/ "./src/core/element/FeatureClass.ts":
/*!******************************************!*\
  !*** ./src/core/element/FeatureClass.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FeatureClass: () => (/* binding */ FeatureClass)
/* harmony export */ });
/* harmony import */ var _render_Field__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Field */ "./src/core/render/Field.ts");
/* harmony import */ var _Feature__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Feature */ "./src/core/element/Feature.ts");
/* harmony import */ var _geometry_Point__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../geometry/Point */ "./src/core/geometry/Point.ts");
/* harmony import */ var _geometry_Polyline__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../geometry/Polyline */ "./src/core/geometry/Polyline.ts");
/* harmony import */ var _geometry_Polygon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../geometry/Polygon */ "./src/core/geometry/Polygon.ts");
/* harmony import */ var _geometry_MultiPoint__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../geometry/MultiPoint */ "./src/core/geometry/MultiPoint.ts");
/* harmony import */ var _geometry_MultiPolyline__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../geometry/MultiPolyline */ "./src/core/geometry/MultiPolyline.ts");
/* harmony import */ var _geometry_MultiPolygon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../geometry/MultiPolygon */ "./src/core/geometry/MultiPolygon.ts");








/**
 * 要素集
 */
class FeatureClass {
    constructor(type, { features = [], fields = [], name = "", alias = "", description = "" } = {}) {
        this.name = name;
        this.alias = alias;
        this.description = description;
        this._features = features;
        this._featureLength = features.length;
        this._fields = fields;
        this._type = type;
    }
    /**
     * 要素集几何图形类型
     */
    get type() { return this._type; }
    /**
     * 要素集各个要素
     */
    get features() { return this._features; }
    /**
     * 要素集各个字段
     */
    get fields() { return this._fields; }
    /**
     * 要素集要素个数
     */
    get length() { return this._featureLength; }
    /**
     * 添加 Feature
     * @param feature
     */
    addFeature(feature) {
        this._features.push(feature);
        this._featureLength++;
    }
    /**
     * 删除指定 Feature
     * @param feature
     * @returns 删去Feature所在的位置
     */
    removeFeature(feature) {
        const index = this._features.findIndex(item => item === feature);
        if (index !== -1)
            this._features.splice(index, 1);
        this._featureLength--;
        return index;
    }
    /**
     * 删除指定位置的 Feature
     * @param K
     * @returns 该位置的 Feature
     */
    removeKth(K) {
        const feature = this._features.splice(K, 1);
        this._featureLength--;
        return feature[0];
    }
    /**
     * 清空 FeatureClass
     */
    clearFeature() {
        this._features = [];
        this._featureLength = 0;
    }
    /**
     * 添加指定字段
     * @param field 字段
     */
    addField(field) {
        this._fields.push(field);
    }
    /**
     * 删除指定字段
     * @param field 字段
     */
    removeField(field) {
        const index = this._fields.findIndex(item => item === field);
        if (index !== -1)
            this._fields.splice(index, 1);
    }
    /**
     * 清空字段
     */
    clearField() {
        this._fields = [];
    }
    /**
     * 解析 GeoJson
     * @param data geojson转后对象
     */
    static fromGeoJson(opts) {
        const features = [];
        Array.isArray(opts.data.features) && opts.data.features.forEach((feature) => {
            switch (feature.geometry.type) {
                case "Point":
                    const point = new _geometry_Point__WEBPACK_IMPORTED_MODULE_2__.Point(feature.geometry.coordinates);
                    features.push(new _Feature__WEBPACK_IMPORTED_MODULE_1__.Feature(point, feature.properties));
                    break;
                case "LineString":
                    const line = new _geometry_Polyline__WEBPACK_IMPORTED_MODULE_3__.Polyline(feature.geometry.coordinates);
                    features.push(new _Feature__WEBPACK_IMPORTED_MODULE_1__.Feature(line, feature.properties));
                    break;
                case "Polygon":
                    const surface = new _geometry_Polygon__WEBPACK_IMPORTED_MODULE_4__.Polygon(feature.geometry.coordinates);
                    features.push(new _Feature__WEBPACK_IMPORTED_MODULE_1__.Feature(surface, feature.properties));
                    break;
                case "MultiPoint":
                    const multiPoint = new _geometry_MultiPoint__WEBPACK_IMPORTED_MODULE_5__.MultiPoint(feature.geometry.coordinates);
                    features.push(new _Feature__WEBPACK_IMPORTED_MODULE_1__.Feature(multiPoint, feature.properties));
                    break;
                case "MultiLineString":
                    const multiLineString = new _geometry_MultiPolyline__WEBPACK_IMPORTED_MODULE_6__.MultiPolyline(feature.geometry.coordinates);
                    features.push(new _Feature__WEBPACK_IMPORTED_MODULE_1__.Feature(multiLineString, feature.properties));
                    break;
                case "MultiPolygon":
                    const multiPolygon = new _geometry_MultiPolygon__WEBPACK_IMPORTED_MODULE_7__.MultiPolygon(feature.geometry.coordinates);
                    features.push(new _Feature__WEBPACK_IMPORTED_MODULE_1__.Feature(multiPolygon, feature.properties));
                    break;
                default:
                    break;
            }
        });
        // 统计字段
        const items = [];
        for (let feature of features) {
            feature.properties && Object.entries(feature.properties).forEach(p => {
                let flag = true;
                const item = {
                    name: p ? p[0] : "",
                    type: typeof (p[1])
                };
                for (let field of items) {
                    if (field.name == item.name)
                        flag = false;
                }
                if (flag)
                    items.push(item);
            });
        }
        const fields = [];
        for (let item of items) {
            const type = item.type === "number" ? _render_Field__WEBPACK_IMPORTED_MODULE_0__.FieldDataType.Number : _render_Field__WEBPACK_IMPORTED_MODULE_0__.FieldDataType.Text;
            fields.push(new _render_Field__WEBPACK_IMPORTED_MODULE_0__.Field(item.name, type));
        }
        return new FeatureClass(opts.type, {
            features: features,
            name: opts.name ? opts.name : "",
            alias: opts.alias ? opts.alias : "",
            description: opts.description ? opts.description : "",
            fields: fields
        });
    }
}


/***/ }),

/***/ "./src/core/geometry/Geometry.ts":
/*!***************************************!*\
  !*** ./src/core/geometry/Geometry.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Geometry: () => (/* binding */ Geometry),
/* harmony export */   GeometryType: () => (/* binding */ GeometryType)
/* harmony export */ });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../index */ "./src/index.ts");
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * 几何图形类型
 */
var GeometryType;
(function (GeometryType) {
    GeometryType[GeometryType["Point"] = 0] = "Point";
    GeometryType[GeometryType["Polyline"] = 1] = "Polyline";
    GeometryType[GeometryType["Polygon"] = 2] = "Polygon";
    GeometryType[GeometryType["MultiPoint"] = 3] = "MultiPoint";
    GeometryType[GeometryType["MultiPolyline"] = 4] = "MultiPolyline";
    GeometryType[GeometryType["MultiPolygon"] = 5] = "MultiPolygon";
})(GeometryType || (GeometryType = {}));
/**
 * 几何图形基类
 */
class Geometry {
    constructor() {
        this._extent = new _render_Extent__WEBPACK_IMPORTED_MODULE_1__.Extent(0, 0, 0, 0);
        this._type = GeometryType.Point;
    }
    /**
     * 几何图形类型
     */
    get type() {
        return this._type;
    }
    /**
     * 包络矩形
     */
    get extent() {
        return this._extent;
    }
    /**
     * 判断两个几何图像是否相交
     * @param {Extent} extent
     * @returns {boolean} 是否相交
     */
    intersect(extent) {
        return extent.intersect(this._extent);
    }
    /**
     * 绘出几何图像（虚函数）
     * @param ctx Canvas画笔
     * @param extent 可视区四至
     * @param symbol 要素样式
     */
    draw(ctx, extent, symbol) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
  * 标注绘制
  * @remarks
  * 标注文本支持多行，/r/n换行
  * @param {string} text - 标注文本
  * @param {CanvasRenderingContext2D} ctx - 绘图上下文
  * @param {SimpleTextSymbol} symbol - 标注符号
  */
    label(text, ctx, symbol = new _index__WEBPACK_IMPORTED_MODULE_0__.SimpleTextSymbol()) {
        if (!text)
            return;
        ctx.save();
        ctx.strokeStyle = symbol.strokeStyle;
        ctx.fillStyle = symbol.fillStyle;
        ctx.lineWidth = symbol.lineWidth;
        ctx.lineJoin = "round";
        ctx.font = symbol.fontSize + "px/1 " + symbol.fontFamily + " " + symbol.fontWeight;
        const center = this.getCenter();
        const matrix = ctx.getTransform();
        //keep pixel
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const array = text.toString().split("/r/n");
        let widths = array.map(str => ctx.measureText(str).width + symbol.padding * 2);
        let width = Math.max(...widths);
        let height = symbol.fontSize * array.length + symbol.padding * 2 + symbol.padding * (array.length - 1);
        const screenX = (matrix.a * center[0] + matrix.e);
        const screenY = (matrix.d * center[1] + matrix.f);
        let totalX, totalY;
        switch (symbol.placement) {
            case "TOP":
                totalX = -width / 2;
                totalY = -symbol.pointSymbolHeight / 2 - height;
                break;
            case "BOTTOM":
                totalX = -width / 2;
                totalY = symbol.pointSymbolHeight / 2;
                break;
            case "RIGHT":
                totalX = symbol.pointSymbolWidth / 2;
                totalY = -height / 2;
                break;
            case "LEFT":
                totalX = -symbol.pointSymbolWidth / 2 - width;
                totalY = -height / 2;
                break;
        }
        ctx.strokeRect(screenX + totalX, screenY + totalY, width, height);
        ctx.fillRect(screenX + totalX, screenY + totalY, width, height);
        ctx.textBaseline = "top";
        ctx.fillStyle = symbol.fontColor;
        array.forEach((str, index) => {
            ctx.fillText(str, screenX + totalX + symbol.padding + (width - widths[index]) / 2, screenY + totalY + symbol.padding + index * (symbol.fontSize + symbol.padding));
        });
        ctx.restore();
    }
    ;
    /**
     * 标注量算
     * @remarks
     * 标注文本支持多行，/r/n换行
     * 目前用于寻找自动标注最合适的方位：top bottom left right
     * @param {string} text - 标注文本
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @param {SimpleTextSymbol} symbol - 标注符号
     */
    measure(text, ctx, symbol = new _index__WEBPACK_IMPORTED_MODULE_0__.SimpleTextSymbol()) {
        if (!text)
            return;
        ctx.save();
        ctx.font = symbol.fontSize + "px/1 " + symbol.fontFamily + " " + symbol.fontWeight;
        const center = this.getCenter();
        const matrix = ctx.getTransform();
        //keep pixel
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const array = text.toString().split("/r/n");
        let widths = array.map(str => ctx.measureText(str).width + symbol.padding * 2);
        let width = Math.max(...widths);
        let height = symbol.fontSize * array.length + symbol.padding * 2 + symbol.padding * (array.length - 1);
        const screenX = (matrix.a * center[0] + matrix.e);
        const screenY = (matrix.d * center[1] + matrix.f);
        ctx.restore();
        let totalX, totalY;
        switch (symbol.placement) {
            case "TOP":
                totalX = -width / 2;
                totalY = -symbol.pointSymbolHeight / 2 - height;
                break;
            case "BOTTOM":
                totalX = -width / 2;
                totalY = symbol.pointSymbolHeight / 2;
                break;
            case "RIGHT":
                totalX = symbol.pointSymbolWidth / 2;
                totalY = -height / 2;
                break;
            case "LEFT":
                totalX = -symbol.pointSymbolWidth / 2 - width;
                totalY = -height / 2;
                break;
        }
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_1__.Extent(screenY + totalY + height, screenY + totalY, screenX + totalX, screenX + totalX + width);
    }
    ;
    /**
     * 获取两个图形间距离
     * @remarks
     * 当前为两图形中心点间的直线距离
     * 多用于聚合判断
     * @param {Geometry} geometry - 另一图形
     * @param {CoordinateType} type - 坐标类型
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {number} 距离
     */
    distance(geometry, ctx) {
        const center = this.getCenter();
        const point = geometry.getCenter();
        const matrix = ctx.getTransform();
        const screenX1 = (matrix.a * center[0] + matrix.e), screenY1 = (matrix.d * center[1] + matrix.f);
        const screenX2 = (matrix.a * point[0] + matrix.e), screenY2 = (matrix.d * point[1] + matrix.f);
        return Math.sqrt((screenX2 - screenX1) * (screenX2 - screenX1) + (screenY2 - screenY1) * (screenY2 - screenY1));
    }
}


/***/ }),

/***/ "./src/core/geometry/MultiPoint.ts":
/*!*****************************************!*\
  !*** ./src/core/geometry/MultiPoint.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiPoint: () => (/* binding */ MultiPoint)
/* harmony export */ });
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/symbol/PointSymbol */ "./src/core/render/symbol/PointSymbol.ts");
/* harmony import */ var _Geometry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Geometry */ "./src/core/geometry/Geometry.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class MultiPoint extends _Geometry__WEBPACK_IMPORTED_MODULE_2__.Geometry {
    constructor(coordinates) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_1__.PointSymbol();
        this._extent = this.getExtent();
        this._type = _Geometry__WEBPACK_IMPORTED_MODULE_2__.GeometryType.MultiPoint;
    }
    toGeoJson() {
        return {
            "type": "MultiPoint",
            "coordinates": this._geoCoordinates
        };
    }
    draw(ctx, extent, symbol = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_1__.PointSymbol) {
        return __awaiter(this, void 0, void 0, function* () {
            // 渲染可视区范围内的几何图像
            if (!extent.intersect(this._extent))
                return;
            // 获得屏幕坐标
            const matrix = ctx.getTransform();
            this._screenCoordinates = this._geoCoordinates.map(point => {
                return [(matrix.a * point[0] + matrix.e), (matrix.d * point[1] + matrix.f)];
            });
            // 获取Symbol
            this._symbol = symbol;
            // 绘制线类型几何图像
            this._screenCoordinates.forEach(point => {
                this._symbol.draw(ctx, point);
            });
        });
    }
    getCenter() {
        return [];
    }
    getExtent() {
        let arr = this._geoCoordinates;
        let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = -Number.MAX_VALUE, ymax = -Number.MAX_VALUE;
        arr.forEach(point => {
            xmin = Math.min(xmin, point[0]);
            ymin = Math.min(ymin, point[1]);
            xmax = Math.max(xmax, point[0]);
            ymax = Math.max(ymax, point[1]);
        });
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_0__.Extent(ymax, ymin, xmin, xmax);
    }
    contain(screenCoordinate) {
        return false;
    }
}


/***/ }),

/***/ "./src/core/geometry/MultiPolygon.ts":
/*!*******************************************!*\
  !*** ./src/core/geometry/MultiPolygon.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiPolygon: () => (/* binding */ MultiPolygon)
/* harmony export */ });
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/symbol/FillSymbol */ "./src/core/render/symbol/FillSymbol.ts");
/* harmony import */ var _Geometry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Geometry */ "./src/core/geometry/Geometry.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class MultiPolygon extends _Geometry__WEBPACK_IMPORTED_MODULE_2__.Geometry {
    constructor(coordinates) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_1__.FillSymbol();
        this._extent = this.getExtent();
        this._type = _Geometry__WEBPACK_IMPORTED_MODULE_2__.GeometryType.Polygon;
    }
    toGeoJson() {
        return {
            "type": "MultiPolygon",
            "coordinates": this._geoCoordinates
        };
    }
    draw(ctx, extent, symbol = new _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_1__.FillSymbol()) {
        return __awaiter(this, void 0, void 0, function* () {
            // 只渲染可视区范围内元素
            if (!extent.intersect(this._extent))
                return;
            const matrix = ctx.getTransform();
            // 获取屏幕坐标
            this._screenCoordinates = this._geoCoordinates.map(polygon => polygon.map(ring => ring.map(point => {
                return [(matrix.a * point[0] + matrix.e), (matrix.d * point[1] + matrix.f)];
            })));
            // 获取Symbol
            this._symbol = symbol;
            // 绘制
            this._screenCoordinates.forEach(polygon => {
                this._symbol.draw(ctx, polygon);
            });
        });
    }
    getCenter() {
        let i, j, p1, p2, f, area, x, y, center;
        // get more points polygon
        const counts = this._geoCoordinates.map(polygon => {
            let count = 0;
            polygon.forEach(ring => {
                count = count + ring.length;
            });
            return count;
        });
        let index = counts.indexOf(Math.max(...counts));
        let points = this._geoCoordinates[index][0], len = points.length;
        if (!len) {
            return null;
        }
        // polygon centroid algorithm; only uses the first ring if there are multiple
        area = x = y = 0;
        for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];
            f = p1[1] * p2[0] - p2[1] * p1[0];
            x += (p1[0] + p2[0]) * f;
            y += (p1[1] + p2[1]) * f;
            area += f * 3;
        }
        if (area === 0) {
            // Polygon is so small that all points are on same pixel.
            center = points[0];
        }
        else {
            center = [x / area, y / area];
        }
        return center;
    }
    getExtent() {
        let arr = this._geoCoordinates;
        let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = -Number.MAX_VALUE, ymax = -Number.MAX_VALUE;
        arr.forEach(polygon => {
            polygon.forEach(ring => {
                ring.forEach(point => {
                    xmin = Math.min(xmin, point[0]);
                    ymin = Math.min(ymin, point[1]);
                    xmax = Math.max(xmax, point[0]);
                    ymax = Math.max(ymax, point[1]);
                });
            });
        });
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_0__.Extent(ymax, ymin, xmin, xmax);
    }
    contain(screenCoordinate) {
        //first ring contained && others no contained
        const _pointInPolygon = (point, vs) => {
            let x = point[0], y = point[1];
            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                let xi = vs[i][0], yi = vs[i][1];
                let xj = vs[j][0], yj = vs[j][1];
                let intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        };
        //TODO: only test first polygon, ring is not supported
        return this._screenCoordinates.some(polygon => _pointInPolygon(screenCoordinate, polygon[0]));
    }
    getArea() {
        let sum = 0;
        this._geoCoordinates.forEach(polygon => {
            polygon.forEach((ring, index) => {
                if (index == 0) {
                    ring.forEach((point, index) => {
                        if (index > 0) {
                            //梯形面积
                            sum += 1 / 2 * (point[0] - ring[index - 1][0]) * (point[1] + ring[index - 1][1]);
                        }
                    });
                    sum += 1 / 2 * (ring[0][0] - ring[ring.length - 1][0]) * (ring[ring.length - 1][1] + ring[0][1]);
                }
            });
        });
        //顺时针为正，逆时针为负
        return Math.abs(sum);
    }
    /**
     * 获取面类型几何图形的周长
     * @returns 周长
     */
    getPerimeter() {
        let primeter = 0;
        this._geoCoordinates.forEach(polygon => {
            polygon.forEach(ring => {
                ring.reduce((pre, cur) => {
                    primeter += this.calculationDistance(pre, cur);
                    return cur;
                });
            });
        });
        return primeter;
    }
    /**
     * 求点1到点2的距离
     * @param point1 点1
     * @param point2 点2
     * @returns {number} 点1到点2的距离
     */
    calculationDistance(point1, point2) {
        return Math.pow((point2[0] - point1[0]), 2) + Math.pow((point2[1] - point1[1]), 2);
    }
}


/***/ }),

/***/ "./src/core/geometry/MultiPolyline.ts":
/*!********************************************!*\
  !*** ./src/core/geometry/MultiPolyline.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiPolyline: () => (/* binding */ MultiPolyline)
/* harmony export */ });
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/symbol/LineSymbol */ "./src/core/render/symbol/LineSymbol.ts");
/* harmony import */ var _Geometry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Geometry */ "./src/core/geometry/Geometry.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class MultiPolyline extends _Geometry__WEBPACK_IMPORTED_MODULE_2__.Geometry {
    constructor(coordinates) {
        super();
        this._tolerance = 4;
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_1__.LineSymbol();
        this._extent = this.getExtent();
        this._type = _Geometry__WEBPACK_IMPORTED_MODULE_2__.GeometryType.MultiPolyline;
    }
    toGeoJson() {
        return {
            "type": "MultiLineString",
            "coordinates": this._geoCoordinates
        };
    }
    draw(ctx, extent, symbol = new _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_1__.LineSymbol()) {
        return __awaiter(this, void 0, void 0, function* () {
            this._tolerance = symbol.lineWidth + symbol.lineWidth;
            // 只渲染可视区范围内元素
            if (!extent.intersect(this._extent))
                return;
            const matrix = ctx.getTransform();
            // 获取屏幕坐标
            this._screenCoordinates = this._geoCoordinates.map(ring => {
                return ring.map(point => {
                    return [(matrix.a * point[0] + matrix.e), (matrix.d * point[1] + matrix.f)];
                });
            });
            // 获取Symbol
            this._symbol = symbol;
            // 绘制
            this._screenCoordinates.forEach(ring => {
                this._symbol.draw(ctx, ring);
            });
        });
    }
    getCenter() {
        let i, halfDist, segDist, dist, p1, p2, ratio, points = this._geoCoordinates[0], len = points.length;
        if (!len) {
            return null;
        }
        // polyline centroid algorithm; only uses the first ring if there are multiple
        for (i = 0, halfDist = 0; i < len - 1; i++) {
            halfDist += Math.sqrt((points[i + 1][0] - points[i][0]) * (points[i + 1][0] - points[i][0]) + (points[i + 1][1] - points[i][1]) * (points[i + 1][1] - points[i][1])) / 2;
        }
        let center;
        // The line is so small in the current view that all points are on the same pixel.
        if (halfDist === 0) {
            center = points[0];
        }
        for (i = 0, dist = 0; i < len - 1; i++) {
            p1 = points[i];
            p2 = points[i + 1];
            segDist = Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
            dist += segDist;
            if (dist > halfDist) {
                ratio = (dist - halfDist) / segDist;
                center = [
                    p2[0] - ratio * (p2[0] - p1[0]),
                    p2[1] - ratio * (p2[1] - p1[1])
                ];
            }
        }
        return center;
    }
    getExtent() {
        let arr = this._geoCoordinates;
        let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = -Number.MAX_VALUE, ymax = -Number.MAX_VALUE;
        arr.forEach(ring => {
            ring.forEach(point => {
                xmin = Math.min(xmin, point[0]);
                ymin = Math.min(ymin, point[1]);
                xmax = Math.max(xmax, point[0]);
                ymax = Math.max(ymax, point[1]);
            });
        });
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_0__.Extent(ymax, ymin, xmin, xmax);
    }
    contain(screenCoordinate) {
        let p2;
        const _distanceToSegment = (p, p1, p2) => {
            let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y, dot = dx * dx + dy * dy, t;
            if (dot > 0) {
                t = ((p[0] - x) * dx + (p[1] - y) * dy) / dot;
                if (t > 1) {
                    x = p2[0];
                    y = p2[1];
                }
                else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }
            dx = p[0] - x;
            dy = p[1] - y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        return this._screenCoordinates.some(polyline => {
            const distance = polyline.reduce((acc, cur) => {
                if (p2) {
                    const p1 = p2;
                    p2 = cur;
                    return Math.min(acc, _distanceToSegment(screenCoordinate, p1, p2));
                }
                else {
                    p2 = cur;
                    return acc;
                }
            }, Number.MAX_VALUE);
            return distance <= this._tolerance;
        });
    }
    /**
     * 获取线类型几何图形的长度
     * from Leaflet
     * @returns {number} 线总长度
     */
    getLength() {
        let sum = 0;
        this._geoCoordinates.forEach((line, i) => {
            line.forEach((point, j) => {
                if (j > 0) {
                    sum += Math.sqrt(Math.pow(point[0] - this._geoCoordinates[i][j - 1][0], 2) + Math.pow(point[1] - this._geoCoordinates[i][j - 1][0], 2));
                }
            });
        });
        return sum;
    }
    /**
     * 求点1到点2的距离
     * @param point1 点1
     * @param point2 点2
     * @returns {number} 点1到点2的距离
     */
    calculationDistance(point1, point2) {
        return Math.sqrt(Math.pow((point2[0] - point1[0]), 2) + Math.pow((point2[1] - point1[1]), 2));
    }
    /**
     * 求A点到BC边的距离
     * @param targetPoint A
     * @param startPoint B
     * @param endPoint C
     * @returns {number} A点到BC边的距离
     */
    calPointToLine(targetPoint, startPoint, endPoint) {
        //下面用海伦公式计算面积
        let a = Math.abs(this.calculationDistance(targetPoint, startPoint));
        let b = Math.abs(this.calculationDistance(targetPoint, endPoint));
        let c = Math.abs(this.calculationDistance(startPoint, endPoint));
        let p = (a + b + c) / 2.0;
        let s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
        return s * 2.0 / a;
    }
}
MultiPolyline.TOLERANCE = 4;


/***/ }),

/***/ "./src/core/geometry/Point.ts":
/*!************************************!*\
  !*** ./src/core/geometry/Point.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Point: () => (/* binding */ Point)
/* harmony export */ });
/* harmony import */ var _Geometry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Geometry */ "./src/core/geometry/Geometry.ts");
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../render/symbol/PointSymbol */ "./src/core/render/symbol/PointSymbol.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * 点类型几何图形
 */
class Point extends _Geometry__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(coordinate) {
        super();
        this._geoCoordinates = coordinate;
        this._screenCoordinates = [];
        this._symbol = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__.PointSymbol();
        this._extent = this.getExtent();
        this._type = _Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point;
    }
    /**
     * 点类型几何图形包络矩形
     */
    get extent() {
        return this._extent;
    }
    toGeoJson() {
        return {
            "type": "Point",
            "coordinates": [this._geoCoordinates[0], this._geoCoordinates[1]]
        };
    }
    /**
     * 绘制几何图像
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     * @param symbol 几何图像符号
     * @returns
     */
    draw(ctx, extent, symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            // 渲染可视区范围内的部分
            if (!extent.intersect(this._extent))
                return;
            // 获取屏幕坐标
            const matrix = ctx.getTransform();
            this._screenCoordinates[0] = (matrix.a * this._geoCoordinates[0] + matrix.e);
            this._screenCoordinates[1] = (matrix.d * this._geoCoordinates[1] + matrix.f);
            // 获取symbol
            if (symbol)
                this._symbol = symbol;
            else
                this._symbol = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__.PointSymbol();
            // 绘制
            this._symbol.draw(ctx, this._screenCoordinates);
        });
    }
    /**
     * 获取几何图形中心点
     * @returns {number[]} 中心点数组 [x, y]
     */
    getCenter() {
        if (this._geoCoordinates)
            return [this._geoCoordinates[0], this._geoCoordinates[1]];
        else
            return null;
    }
    /**
     * 获取点类型几何图形包络矩形
     * @returns {Extent} 几何图形包络矩形
     */
    getExtent() {
        const xmax = this._geoCoordinates[0];
        const xmin = this._geoCoordinates[0];
        const ymax = this._geoCoordinates[1];
        const ymin = this._geoCoordinates[1];
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_1__.Extent(ymax, ymin, xmin, xmax);
    }
    /**
     * 判断鼠标点是否在点类型几何图形范围内
     * @param screenCoordinate 鼠标屏幕坐标
     * @returns {boolean}
     */
    contain(screenCoordinate) {
        if (this._symbol)
            return this._symbol.contain(screenCoordinate, this._screenCoordinates);
        else
            return false;
    }
}


/***/ }),

/***/ "./src/core/geometry/Polygon.ts":
/*!**************************************!*\
  !*** ./src/core/geometry/Polygon.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Polygon: () => (/* binding */ Polygon)
/* harmony export */ });
/* harmony import */ var _Geometry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Geometry */ "./src/core/geometry/Geometry.ts");
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../render/symbol/FillSymbol */ "./src/core/render/symbol/FillSymbol.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * 面类型几何图形
 */
class Polygon extends _Geometry__WEBPACK_IMPORTED_MODULE_0__.Geometry {
    constructor(coordinates) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_2__.FillSymbol();
        this._extent = this.getExtent();
        this._type = _Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon;
    }
    /**
     * 面类型几何图形包络矩形
     */
    get extent() {
        return this._extent;
    }
    toGeoJson() {
        return {
            "type": "Polygon",
            "coordinates": this._geoCoordinates
        };
    }
    /**
     * 绘制面类型几何图形
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     * @param symbol 几何图形符号
     * @returns
     */
    draw(ctx, extent, symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            // 只渲染可视区范围内元素
            if (!extent.intersect(this._extent))
                return;
            const matrix = ctx.getTransform();
            // 获取屏幕坐标
            this._screenCoordinates = this._geoCoordinates.map(ring => {
                return ring.map(point => {
                    return [(matrix.a * point[0] + matrix.e), (matrix.d * point[1] + matrix.f)];
                });
            });
            // 获取Symbol
            if (symbol)
                this._symbol = symbol;
            else
                this._symbol = new _render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_2__.FillSymbol();
            // 绘制
            this._symbol.draw(ctx, this._screenCoordinates);
        });
    }
    /**
     * 获取面类型几何图形中心点坐标
     * @returns 中心点坐标
     */
    getCenter() {
        let i, j, p1, p2, f, area, x, y, center, points = this._geoCoordinates[0], len = points.length;
        if (!len) {
            return null;
        }
        // polygon centroid algorithm; only uses the first ring if there are multiple
        area = x = y = 0;
        for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];
            f = p1[1] * p2[0] - p2[1] * p1[0];
            x += (p1[0] + p2[0]) * f;
            y += (p1[1] + p2[1]) * f;
            area += f * 3;
        }
        if (area === 0) {
            // Polygon is so small that all points are on same pixel.
            center = points[0];
        }
        else {
            center = [x / area, y / area];
        }
        return center;
    }
    /**
     * 获取面类型几何图形的包络矩形
     * @returns 几何图形包络矩形
     */
    getExtent() {
        let x_arr = [], y_arr = [];
        this._geoCoordinates.forEach(ring => {
            ring.forEach(point => {
                x_arr.push(point[0]);
                y_arr.push(point[1]);
            });
        });
        const xmax = Math.max(...x_arr);
        const xmin = Math.min(...x_arr);
        const ymax = Math.max(...y_arr);
        const ymin = Math.min(...y_arr);
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_1__.Extent(ymax, ymin, xmin, xmax);
    }
    /**
     * 判断鼠标点是否在面类型几何图形范围内
     * @param screenCoordinate 鼠标屏幕坐标
     * @returns
     */
    contain(screenCoordinate) {
        const first = this._screenCoordinates[0];
        const others = this._screenCoordinates.slice(1);
        //first ring contained && others no contained
        const _pointInPolygon = (point, vs) => {
            let x = point[0], y = point[1];
            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                let xi = vs[i][0], yi = vs[i][1];
                let xj = vs[j][0], yj = vs[j][1];
                let intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect)
                    inside = !inside;
            }
            return inside;
        };
        return this._screenCoordinates.some(ring => _pointInPolygon(screenCoordinate, ring));
    }
    /**
     * 获取面类型几何图形面积
     * @returns 面积
     */
    getArea() {
        let sum = 0;
        this._geoCoordinates.forEach((ring, index) => {
            if (index == 0) {
                ring.forEach((point, index) => {
                    if (index > 0) {
                        //梯形面积
                        sum += 1 / 2 * (point[0] - ring[index - 1][0]) * (point[1] + ring[index - 1][1]);
                    }
                });
                sum += 1 / 2 * (ring[0][0] - ring[ring.length - 1][0]) * (ring[ring.length - 1][1] + ring[0][1]);
            }
        });
        //顺时针为正，逆时针为负
        return Math.abs(sum);
    }
    /**
     * 获取面类型几何图形的周长
     * @returns 周长
     */
    getPerimeter() {
        let primeter = 0;
        this._geoCoordinates.forEach(ring => {
            ring.reduce((pre, cur) => {
                primeter += this.calculationDistance(pre, cur);
                return cur;
            });
        });
        return primeter;
    }
    /**
     * 求点1到点2的距离
     * @param point1 点1
     * @param point2 点2
     * @returns {number} 点1到点2的距离
     */
    calculationDistance(point1, point2) {
        return Math.pow((point2[0] - point1[0]), 2) + Math.pow((point2[1] - point1[1]), 2);
    }
}


/***/ }),

/***/ "./src/core/geometry/Polyline.ts":
/*!***************************************!*\
  !*** ./src/core/geometry/Polyline.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Polyline: () => (/* binding */ Polyline)
/* harmony export */ });
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _Geometry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Geometry */ "./src/core/geometry/Geometry.ts");
/* harmony import */ var _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../render/symbol/LineSymbol */ "./src/core/render/symbol/LineSymbol.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * 线类型几何图形
 */
class Polyline extends _Geometry__WEBPACK_IMPORTED_MODULE_1__.Geometry {
    constructor(coordinates) {
        super();
        this._tolerance = 4;
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_2__.LineSymbol();
        this._extent = this.getExtent();
        this._type = _Geometry__WEBPACK_IMPORTED_MODULE_1__.GeometryType.Polyline;
    }
    /**
     * 线类型几何图形包络矩形
     */
    get extent() {
        return this._extent;
    }
    toGeoJson() {
        return {
            "type": "LineString",
            "coordinates": this._geoCoordinates
        };
    }
    /**
     * 绘制几何图像
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     * @param symbol 几何图像符号
     * @returns
     */
    draw(ctx, extent, symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            // 渲染可视区范围内的几何图像
            if (!extent.intersect(this._extent))
                return;
            // 获得屏幕坐标
            const matrix = ctx.getTransform();
            this._screenCoordinates = this._geoCoordinates.map(point => {
                return [(matrix.a * point[0] + matrix.e), (matrix.d * point[1] + matrix.f)];
            });
            // 获取Symbol
            if (symbol)
                this._symbol = symbol;
            else
                this._symbol = new _render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_2__.LineSymbol();
            // 绘制线类型几何图像
            this._symbol.draw(ctx, this._screenCoordinates);
        });
    }
    /**
     * 获取线类型几何图形中心点
     * @returns {number[] | null} 几何图形中心点
     */
    getCenter() {
        let i, halfDist, segDist, dist, p1, p2, ratio, points = this._geoCoordinates, len = points.length;
        if (!len) {
            return null;
        }
        // polyline centroid algorithm; only uses the first ring if there are multiple
        for (i = 0, halfDist = 0; i < len - 1; i++) {
            halfDist += Math.sqrt((points[i + 1][0] - points[i][0]) * (points[i + 1][0] - points[i][0]) + (points[i + 1][1] - points[i][1]) * (points[i + 1][1] - points[i][1])) / 2;
        }
        let center = [];
        // The line is so small in the current view that all points are on the same pixel.
        if (halfDist === 0) {
            center = points[0];
        }
        for (i = 0, dist = 0; i < len - 1; i++) {
            p1 = points[i];
            p2 = points[i + 1];
            segDist = Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
            dist += segDist;
            if (dist > halfDist) {
                ratio = (dist - halfDist) / segDist;
                center = [
                    p2[0] - ratio * (p2[0] - p1[0]),
                    p2[1] - ratio * (p2[1] - p1[1])
                ];
            }
        }
        return center;
    }
    /**
     * 获取线类型几何图形的包络矩形
     * @returns {Extent} 几何图形包络矩形
     */
    getExtent() {
        let x_arr = [], y_arr = [];
        this._geoCoordinates.forEach(point => {
            x_arr.push(point[0]);
            y_arr.push(point[1]);
        });
        const xmax = Math.max(...x_arr);
        const xmin = Math.min(...x_arr);
        const ymax = Math.max(...y_arr);
        const ymin = Math.min(...y_arr);
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_0__.Extent(ymax, ymin, xmin, xmax);
    }
    /**
     * 判断鼠标点是否在线类型几何图形符号范围之内
     * @param screenCoordinate 鼠标屏幕坐标
     * @returns {boolean}
     */
    contain(screenCoordinate) {
        let p2;
        //from Leaflet
        //点到线段的距离，垂直距离
        const _distanceToSegment = (p, p1, p2) => {
            let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y, dot = dx * dx + dy * dy, t;
            if (dot > 0) {
                t = ((p[0] - x) * dx + (p[1] - y) * dy) / dot;
                if (t > 1) {
                    x = p2[0];
                    y = p2[1];
                }
                else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }
            dx = p[0] - x;
            dy = p[1] - y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        const distance = this._screenCoordinates.reduce((acc, cur) => {
            if (p2) {
                const p1 = p2;
                p2 = cur;
                return Math.min(acc, _distanceToSegment(screenCoordinate, p1, p2));
            }
            else {
                p2 = cur;
                return acc;
            }
        }, Number.MAX_VALUE);
        return distance <= this._tolerance;
    }
    /**
     * 获取线类型几何图形的长度
     * from Leaflet
     * @returns {number} 线总长度
     */
    getLength() {
        let sum = 0;
        this._geoCoordinates.forEach((point, index) => {
            if (index > 0) {
                sum += Math.sqrt(Math.pow(point[0] - this._geoCoordinates[index - 1][0], 2) + Math.pow(point[1] - this._geoCoordinates[index - 1][1], 2));
            }
        });
        return sum;
    }
    /**
     * 求点1到点2的距离
     * @param point1 点1
     * @param point2 点2
     * @returns {number} 点1到点2的距离
     */
    calculationDistance(point1, point2) {
        return Math.pow((point2[0] - point1[0]), 2) + Math.pow((point2[1] - point1[1]), 2);
    }
    /**
     * 求A点到BC边的距离
     * @param targetPoint A
     * @param startPoint B
     * @param endPoint C
     * @returns {number} A点到BC边的距离
     */
    calPointToLine(targetPoint, startPoint, endPoint) {
        //下面用海伦公式计算面积
        let a = Math.abs(this.calculationDistance(targetPoint, startPoint));
        let b = Math.abs(this.calculationDistance(targetPoint, endPoint));
        let c = Math.abs(this.calculationDistance(startPoint, endPoint));
        let p = (a + b + c) / 2.0;
        let s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
        return s * 2.0 / a;
    }
}
/**
 * 容差
 * 用于鼠标交互
 * 单位：pixel
 */
Polyline.TOLERANCE = 4;


/***/ }),

/***/ "./src/core/interaction/Interaction.ts":
/*!*********************************************!*\
  !*** ./src/core/interaction/Interaction.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClearHighlighted: () => (/* binding */ ClearHighlighted),
/* harmony export */   ClickHighlighted: () => (/* binding */ ClickHighlighted),
/* harmony export */   scaleGeometry: () => (/* binding */ scaleGeometry),
/* harmony export */   screenToGeo: () => (/* binding */ screenToGeo)
/* harmony export */ });
/**
 * 放大缩小几何图形
 * @param ctx Canvas上下文
 * @param target 聚焦点
 * @param scale 放大缩小倍数
 * @return {CanvasRenderingContext2D} Canvas上下文
 * @remarks 在ctx中存储的变换矩阵是重点
 */
const scaleGeometry = (ctx, target, scale) => {
    const matrix = ctx.getTransform();
    // 计算水平偏移量
    const a1 = matrix.a, e1 = matrix.e, x1 = target.x, x2 = x1;
    // 水平偏移量
    const e = (x2 - scale * (x1 - e1) - e1) / a1;
    // 计算垂直偏移量
    const d1 = matrix.d, f1 = matrix.f, y1 = target.y, y2 = y1;
    // 垂直偏移量
    const f = (y2 - scale * (y1 - f1) - f1) / d1;
    ctx.transform(scale, 0, 0, scale, e, f);
    return ctx;
};
/**
 * 屏幕坐标转地理坐标
 * @param ctx Canvas上下文
 * @param coordinate 屏幕点坐标
 * @returns 地理点坐标
 */
const screenToGeo = (ctx, coordinate) => {
    const matrix = ctx.getTransform();
    const x_screen = coordinate[0], y_screen = coordinate[1];
    const x_geo = (x_screen - matrix.e) / matrix.a, y_geo = (y_screen - matrix.f) / matrix.d;
    return [x_geo, y_geo];
};
/**
 * 点击要素高亮
 * @param screenCoordinat 屏幕点坐标
 * @param extent 可视区范围
 * @param featureLayer 图层
 * @remarks Map根据是否开启identify调用该方法
 */
const ClickHighlighted = (screenCoordinat, extent, featureLayer) => {
    // 当identify开启，则可以使用该函数
    // 遍历可视区范围内的每一个要素的Geometry，利用contain函数判断是否点击到
    featureLayer.featureClass.features.forEach(feature => {
        // 如果不相交，则退出
        if (feature.geometry.intersect(extent))
            return;
        if (feature.geometry.contain(screenCoordinat)) {
            // 如果点到了
            feature.isHeightLighted = true;
        }
        else {
            // 如果没点到
            feature.isHeightLighted = false;
        }
    });
    // 如果点击到，启动Feature的isHignLight属性，利用高亮的symbol
    // 点击其他区域，则取消这个高亮symbol，用原来的symbol重绘
};
/**
 * 清除高亮
 * @param featureLayer 图层
 */
const ClearHighlighted = (featureLayer) => {
    featureLayer.featureClass.features.forEach(feature => {
        feature.isHeightLighted = false;
    });
};


/***/ }),

/***/ "./src/core/label/Label.ts":
/*!*********************************!*\
  !*** ./src/core/label/Label.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Label: () => (/* binding */ Label)
/* harmony export */ });
/* harmony import */ var _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/symbol/PointSymbol */ "./src/core/render/symbol/PointSymbol.ts");
/* harmony import */ var _collision__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collision */ "./src/core/label/collision.ts");


/**
 * 图层标注设置
 */
class Label {
    constructor({ field, symbol, collision }) {
        this.field = field;
        this.symbol = symbol ? symbol : new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_0__.SimpleTextSymbol();
        this.collision = collision ? collision : new _collision__WEBPACK_IMPORTED_MODULE_1__.SimpleCollision();
    }
    /**
     * 绘制图层标注
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     */
    draw(features, ctx) {
        //通过冲突检测，得到要绘制的要素集合
        const remain = this.collision.test(features, this.field, this.symbol, ctx);
        //遍历绘制要素标注
        remain.forEach((feature) => {
            feature.label(this.field, ctx, this.symbol);
        });
    }
}


/***/ }),

/***/ "./src/core/label/collision.ts":
/*!*************************************!*\
  !*** ./src/core/label/collision.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collision: () => (/* binding */ Collision),
/* harmony export */   CoverCollision: () => (/* binding */ CoverCollision),
/* harmony export */   NullCollision: () => (/* binding */ NullCollision),
/* harmony export */   SimpleCollision: () => (/* binding */ SimpleCollision)
/* harmony export */ });
/* harmony import */ var _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/symbol/PointSymbol */ "./src/core/render/symbol/PointSymbol.ts");

/**
 * 冲突检测基类
 */
class Collision {
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features, field, symbol, ctx) { return []; }
}
/**
 * 无检测机制
 */
class NullCollision {
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features, field, symbol, ctx) {
        //没有任何检测逻辑，直接原样返回
        return features;
    }
}
/**
 * 简单碰撞冲突
 * @remarks
 * 类似聚合，距离判断，速度快
 */
class SimpleCollision {
    constructor() {
        /**
         * 检测距离
         * @remarks
         * 单位 pixel
         */
        this.distance = 50;
    }
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features, field, symbol, ctx) {
        //根据距离聚合
        return features.reduce((acc, cur) => {
            const item = acc.find((item) => {
                const distance = cur.geometry.distance(item.geometry, ctx);
                return distance <= this.distance;
            });
            if (!item)
                acc.push(cur);
            return acc;
        }, []); // [feature]
    }
}
/**
 * 叠盖碰撞冲突
 * @remarks
 * 试算标注宽高，并和已通过检测的标注，进行边界的交叉判断，速度慢
 */
class CoverCollision {
    constructor() {
        /**
         * 已通过检测的标注的边界集合
         */
        this._extents = [];
        /**
         * 判断边界碰撞时的buffer
         * @remarks
         * buffer越小，标注越密，单位：pixel
         */
        this.buffer = 10;
    }
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features, field, symbol, ctx) {
        if (!field || !symbol)
            return [];
        this._extents = [];
        const measure = (feature, symbol) => {
            const extent = feature.geometry.measure(feature.properties[field.name], ctx, symbol);
            extent.buffer(this.buffer);
            if (extent) {
                const item = this._extents.find(item => item.intersect(extent));
                if (!item) {
                    return extent;
                }
            }
            return null;
        };
        const replace = (feature, symbol, count) => {
            const symbol2 = new _render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_0__.SimpleTextSymbol();
            symbol2.copy(symbol);
            symbol2.replacement();
            const bound = measure(feature, symbol2);
            if (bound) {
                return [bound, symbol2];
            }
            else {
                if (count == 0) {
                    return [null, null];
                }
                else {
                    count -= 1;
                    return replace(feature, symbol2, count);
                }
            }
        };
        //根据标注宽高的量算，得到标注的size，并和已通过检测的标注，进行边界的交叉判断，来决定是否可绘制该要素的标注
        return features.reduce((acc, cur) => {
            cur.text = null;
            let bound = measure(cur, symbol);
            if (bound) {
                acc.push(cur);
                this._extents.push(bound);
            }
            else {
                if (symbol.auto) {
                    const [bound, symbol2] = replace(cur, symbol, 3); //一共4个方向，再测试剩余3个方向
                    if (bound) {
                        cur.text = symbol2;
                        acc.push(cur);
                        this._extents.push(bound);
                    }
                }
            }
            return acc;
        }, []); // [feature]
    }
}


/***/ }),

/***/ "./src/core/layer/FeatureLayer.ts":
/*!****************************************!*\
  !*** ./src/core/layer/FeatureLayer.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FeatureLayer: () => (/* binding */ FeatureLayer)
/* harmony export */ });
/* harmony import */ var _Layer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Layer */ "./src/core/layer/Layer.ts");
/* harmony import */ var _render_Extent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _render_renderer_SimpleRenderer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../render/renderer/SimpleRenderer */ "./src/core/render/renderer/SimpleRenderer.ts");



/**
 * 要素图层
 */
class FeatureLayer extends _Layer__WEBPACK_IMPORTED_MODULE_0__.Layer {
    constructor(featureClass, renderer = new _render_renderer_SimpleRenderer__WEBPACK_IMPORTED_MODULE_2__.SimpleRenderer(featureClass.type)) {
        super();
        /**
         * 是否显示标注
         */
        this.labeled = false;
        this._featureClass = featureClass;
        this._renderer = renderer;
        this._extent = this.getExtentFromFeature();
    }
    /**
     * 图层标注设置
     */
    get label() {
        return this._label;
    }
    set label(value) {
        this._label = value;
    }
    /**
     * 图层要素集
     */
    get featureClass() {
        return this._featureClass;
    }
    set featureClass(featureClass) {
        this._featureClass = featureClass;
    }
    /**
     * 图层渲染方式
     */
    get renderer() {
        return this._renderer;
    }
    set renderer(renderer) {
        this._renderer = renderer;
    }
    /**
     * 图层包络矩形
     */
    get extent() {
        return this._extent;
    }
    /**
     * 通过FeatureLayer绘制
     * @param ctx
     * @param extent
     * @returns
     */
    draw(ctx, extent, zoom) {
        if (!this.visible || zoom < this.minZoom || zoom > this.maxZoom) {
            return;
        }
        // 筛选出与可视区相交的feature
        const features = this._featureClass.features.filter(feature => feature.intersect(extent));
        // 获取该渲染方式下，每一个要素对应的symbol
        features.forEach(feature => {
            feature.draw(ctx, extent, this.renderer.getSymbol(feature));
        });
    }
    /**
     * 绘制标注
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Extent} extent - 当前可视范围
     * @param {number} zoom - 当前缩放级别
     */
    drawLabel(ctx, extent, zoom) {
        if (this.visible && this.minZoom <= zoom && this.maxZoom >= zoom) {
            const features = this._featureClass.features.filter((feature) => feature.intersect(extent));
            this._label.draw(features, ctx);
        }
    }
    /**
     * 动态获取FeatureLayer中的最大Extent
     * @returns {Extent} 图层Extent
     */
    getExtentFromFeature() {
        const xMaxArr = [];
        const xMinArr = [];
        const yMaxArr = [];
        const yMinArr = [];
        this._featureClass.features.forEach(feature => {
            xMaxArr.push(feature.geometry.getExtent().xmax);
            xMinArr.push(feature.geometry.getExtent().xmin);
            yMaxArr.push(feature.geometry.getExtent().ymax);
            yMinArr.push(feature.geometry.getExtent().ymin);
        });
        return new _render_Extent__WEBPACK_IMPORTED_MODULE_1__.Extent(Math.max(...yMaxArr), Math.min(...yMinArr), Math.min(...xMinArr), Math.max(...xMaxArr));
    }
}


/***/ }),

/***/ "./src/core/layer/Layer.ts":
/*!*********************************!*\
  !*** ./src/core/layer/Layer.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Layer: () => (/* binding */ Layer)
/* harmony export */ });
/**
 * 图层基类
 */
class Layer {
    constructor(name = "", des = "") {
        this.minZoom = 0;
        this.maxZoom = 10;
        this.name = name;
        this.description = des;
        this.visible = true;
    }
    /**
     * 对图层进行绘制
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     */
    draw(ctx, extent, zoom) { }
}


/***/ }),

/***/ "./src/core/layer/Tiles.ts":
/*!*********************************!*\
  !*** ./src/core/layer/Tiles.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Tiles: () => (/* binding */ Tiles)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Tiles {
    constructor({ map, extent, url, resolution }) {
        this._map = map;
        this._url = url;
        this._extent = extent;
        this._resolution = resolution;
        //create div
        this._container = document.createElement("div");
        this._container.style.height = this._map.container.clientHeight + "px";
        this._container.style.width = this._map.container.clientWidth + "px";
        this._container.style.position = "absolute";
        this._container.style.top = this._map.container.style.top;
        this._container.style.zIndex = "-1";
        this._container.style.pointerEvents = "none";
        this._container.style.overflow = "hidden";
        this._container.style.userSelect = "none";
        this._map.container.appendChild(this._container);
        this._extentChange = this._extentChange.bind(this);
        // this._map.on("extent", this._extentChange);
        window.addEventListener("resize", this._onResize.bind(this));
        // this.draw();
    }
    get url() { return this._url; }
    set url(value) { this._url = value; }
    get extent() { return this._extent; }
    _extentChange(event) {
        this.draw();
    }
    draw() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._url)
                return;
            this._container.innerHTML = "";
            const extent = this._map.getViewExtent();
            const zoom = this._map.zoom;
            const [tileMinX, tileMinY, tileMaxX, tileMaxY] = this._geoCoord2Tile(extent, zoom);
            const [pixelX, pixelY] = this._geoCoord2Pixel(extent, zoom);
            for (let x = tileMinX; x <= tileMaxX; x++) {
                for (let y = tileMinY; y <= tileMaxY; y++) {
                    const url = this._getURL(this._url, y, x, zoom);
                    let tile = new Image(256, 256);
                    tile.onload = () => {
                        tile.style.position = "absolute";
                        tile.style.left = `${(x - tileMinX) * 256 + pixelX}px`;
                        tile.style.top = `${(y - tileMinY) * 256 + pixelY}px`;
                        this._container.appendChild(tile);
                    };
                    // tile.src = url;
                }
            }
        });
    }
    _geoCoord2Tile(extent, zoom) {
        const tileSize = 256;
        const resolution = this._resolution[zoom];
        const startX = Math.floor((extent.xmin - this._extent.xmin) / (tileSize * resolution));
        const startY = Math.floor((this._extent.ymax - extent.ymax) / (tileSize * resolution));
        const endX = Math.ceil((extent.xmax - this._extent.xmin) / (tileSize * resolution));
        const endY = Math.ceil((this._extent.ymax - extent.ymin) / (tileSize * resolution));
        return [startX, startY, endX, endY];
    }
    _geoCoord2Pixel(extent, zoom) {
        const tileSize = 256;
        const tileResolution = this._resolution[zoom];
        const pixelX = Math.floor((extent.xmin / tileResolution) / tileSize);
        const pixelY = Math.floor((extent.ymax / tileResolution) / tileSize);
        return [pixelX, pixelY];
    }
    _getURL(baseURL, X, Y, Z) {
        return baseURL
            .replace("{x}", X.toString())
            .replace("{y}", Y.toString())
            .replace("{z}", Z.toString());
    }
    _onResize() {
        this._container.style.width = this._map.container.clientWidth + "px";
        this._container.style.height = this._map.container.clientHeight + "px";
        this.draw();
    }
}


/***/ }),

/***/ "./src/core/render/Color.ts":
/*!**********************************!*\
  !*** ./src/core/render/Color.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Color: () => (/* binding */ Color)
/* harmony export */ });
/**
 * 十进制颜色
 */
class Color {
    constructor(r, g, b, a = 1) {
        this.a = a;
        this.b = b;
        this.g = g;
        this.r = r;
    }
    /**
     * 输出rgba值
     * @returns {string} rgba
     */
    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    /**
     * 十六进制表示法转十进制表示法 RGB
     * @param {string} hex 十六进制
     * @returns 十进制颜色
     */
    static hexToRgb(hex) {
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/;
        hex = hex.toLowerCase();
        if (hex && reg.test(hex)) {
            //处理三位的颜色值
            if (hex.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += hex.slice(i, i + 1).concat(hex.slice(i, i + 1));
                }
                hex = sColorNew;
            }
            //处理六位的颜色值
            if (hex.length === 7) {
                hex += "ff";
            }
            let sColorChange = [];
            for (let i = 1; i < 9; i += 2) {
                sColorChange.push(parseInt("0x" + hex.slice(i, i + 2)));
            }
            return new Color(sColorChange[0], sColorChange[1], sColorChange[2], sColorChange[3] / 255);
        }
        console.log("error Hex!");
        return new Color(0, 0, 0, 0);
    }
    /**
     * 十进制表示法 RGB 转十六进制表示法
     * @param color RGB颜色
     * @returns 十六进制颜色
     */
    static rgbToHex(color) {
        return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }
    /**
     * 生成随机颜色
     * @returns {Color} 随机颜色
     */
    static random() {
        return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    }
    /**
     * 获取线性色带
     * @param start 起始颜色
     * @param end 终止颜色
     * @param count 间断数
     */
    static ramp(start, end, count = 10) {
        const colors = [];
        for (let i = 0; i < count; ++i) {
            colors.push(new Color((end.r - start.r) * i / count + start.r, (end.g - start.g) * i / count + start.g, (end.b - start.b) * i / count + start.b, (end.a - start.a) * i / count + start.a));
        }
        return colors;
    }
}


/***/ }),

/***/ "./src/core/render/Extent.ts":
/*!***********************************!*\
  !*** ./src/core/render/Extent.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Extent: () => (/* binding */ Extent)
/* harmony export */ });
/**
 * 包络矩形
 * 用于空间分析，以及可视范围内渲染的判断等等
 * 用于参数的往往是可视区矩形
 * */
class Extent {
    constructor(ymax, ymin, xmin, xmax) {
        this._ymax = ymax;
        this._ymin = ymin;
        this._xmin = xmin;
        this._xmax = xmax;
        this._xscale = xmin <= xmax ? 1 : -1;
        this._yscale = ymin <= ymax ? -1 : 1;
    }
    /**
     * 四至
     */
    get ymax() { return this._ymax; }
    get ymin() { return this._ymin; }
    get xmin() { return this._xmin; }
    get xmax() { return this._xmax; }
    get xscale() { return this._xscale; }
    get yscale() { return this._yscale; }
    /**
     * 判断两个几何图像是否相交
     * @param {Extent} extent
     * @returns {boolean} 是否相交
     */
    intersect(extent) {
        if ((extent.xmax >= this.xmin) &&
            (extent.xmin <= this.xmax) &&
            (extent.ymax >= this.ymin) &&
            (extent.ymin <= this.ymax))
            return true;
        else
            return false;
    }
    /**
    * 缓冲整个边界，类似拓宽
    * @param {number} size - 拓宽相应尺寸
    */
    buffer(size) {
        this._xmin -= size;
        this._ymin -= size;
        this._xmax += size;
        this._ymax += size;
    }
}


/***/ }),

/***/ "./src/core/render/Field.ts":
/*!**********************************!*\
  !*** ./src/core/render/Field.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Field: () => (/* binding */ Field),
/* harmony export */   FieldDataType: () => (/* binding */ FieldDataType)
/* harmony export */ });
var FieldDataType;
(function (FieldDataType) {
    FieldDataType[FieldDataType["Text"] = 0] = "Text";
    FieldDataType[FieldDataType["Number"] = 1] = "Number";
})(FieldDataType || (FieldDataType = {}));
/**
 * 字段
 */
class Field {
    constructor(name, type = FieldDataType.Text, alias = "") {
        this.name = name;
        this.alias = alias;
        this.type = type;
    }
}


/***/ }),

/***/ "./src/core/render/renderer/CategoryRenderer.ts":
/*!******************************************************!*\
  !*** ./src/core/render/renderer/CategoryRenderer.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CategoryRenderer: () => (/* binding */ CategoryRenderer),
/* harmony export */   CategoryRendererItem: () => (/* binding */ CategoryRendererItem)
/* harmony export */ });
/* harmony import */ var _Renderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Renderer */ "./src/core/render/renderer/Renderer.ts");

class CategoryRendererItem {
    constructor(value, symbol, count = 1, label = value.toString()) {
        this.value = value;
        this.symbol = symbol;
        this.count = count;
        this.label = label;
    }
}
/**
 * 分类渲染
 */
class CategoryRenderer extends _Renderer__WEBPACK_IMPORTED_MODULE_0__.Renderer {
    constructor(field, items) {
        super();
        this._field = field;
        this._items = items;
    }
    /**
     * 分类渲染所用字段
     */
    get field() {
        return this._field;
    }
    /**
     * 分类渲染项
     */
    get items() {
        return this._items;
    }
    /**
     * 按照指定字段在指定要素集中分类渲染
     * @param featureClass 要素集
     * @param field 分类字段
     * @returns
     */
    static generate(featureClass, field) {
        let items = [];
        let symbol;
        // 分类统计 获取items
        featureClass.features.map(feature => feature.properties[field.name]).forEach(value => {
            // 此处的value为properties中与field相同name的object
            // 循环中遇到相同的value则count++
            let item = items.find(item => item.value === value);
            if (item) {
                item.count++;
            }
            else {
                symbol = _Renderer__WEBPACK_IMPORTED_MODULE_0__.Renderer.getRandomSymbol(featureClass.type);
                const item = new CategoryRendererItem(value, symbol);
                items.push(item);
            }
        });
        return new CategoryRenderer(field, items);
    }
    /**
     * 分级渲染下特点属性值对应的Symbol
     * @param feature 要素
     */
    getSymbol(feature) {
        const value = feature.properties[this._field.name];
        const item = this._items.filter(item => {
            return item.value === value;
        })[0];
        return item.symbol;
    }
}


/***/ }),

/***/ "./src/core/render/renderer/ClassRenderer.ts":
/*!***************************************************!*\
  !*** ./src/core/render/renderer/ClassRenderer.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClassRenderer: () => (/* binding */ ClassRenderer)
/* harmony export */ });
/* harmony import */ var _Renderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Renderer */ "./src/core/render/renderer/Renderer.ts");

/**
 * 分级渲染依赖的级结构
 */
class ClassRendererItem {
    constructor(low, hign, symbol, label = (low + " - " + hign)) {
        this.hign = hign;
        this.low = low;
        this.label = label;
        this.symbol = symbol;
    }
}
/**
 * 分级渲染
 */
class ClassRenderer extends _Renderer__WEBPACK_IMPORTED_MODULE_0__.Renderer {
    constructor(field, items) {
        super();
        this._field = field;
        this._items = items;
    }
    /**
     * 分级渲染分级项集合
     */
    get item() {
        return this._items;
    }
    /**
     * 分级渲染的基础字段
     */
    get field() {
        return this._field;
    }
    /**
     * 等间距分级渲染
     * @param featureClass 要素集
     * @param field 分级字段
     * @param breaks 类别数
     */
    static generate(featureClass, field, breaks) {
        const items = [];
        // 获取最大最小值
        const stat = featureClass.features.map(feature => feature.properties[field.name]).reduce((stat, cur) => {
            stat.max = Math.max(cur, stat.max);
            stat.min = Math.min(cur, stat.min);
        }, { min: Number.MIN_VALUE, max: Number.MAX_VALUE });
        // 间隔
        const interval = stat.max - stat.min;
        // 放入item
        for (let i = 0; i < breaks; ++i) {
            const symbol = _Renderer__WEBPACK_IMPORTED_MODULE_0__.Renderer.getRandomSymbol(featureClass.type);
            const low = stat.min + i * interval / breaks;
            const hign = stat.min + (i + 1) * interval / breaks;
            const label = `${low} - ${hign}`;
            const item = new ClassRendererItem(low, hign, symbol, label);
            items.push(item);
        }
        return new ClassRenderer(field, items);
    }
    /**
     * 获取分级渲染下对应属性值的Symbol
     * @param feature 要素
     */
    getSymbol(feature) {
        const value = feature.properties[this.field.name];
        const item = this._items.filter(item => {
            if (item.hign > value && item.low < value)
                return true;
            else
                return false;
        })[0];
        return item.symbol;
    }
}


/***/ }),

/***/ "./src/core/render/renderer/Renderer.ts":
/*!**********************************************!*\
  !*** ./src/core/render/renderer/Renderer.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Renderer: () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _geometry_Geometry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../geometry/Geometry */ "./src/core/geometry/Geometry.ts");
/* harmony import */ var _Color__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Color */ "./src/core/render/Color.ts");
/* harmony import */ var _symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../symbol/PointSymbol */ "./src/core/render/symbol/PointSymbol.ts");
/* harmony import */ var _symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../symbol/LineSymbol */ "./src/core/render/symbol/LineSymbol.ts");
/* harmony import */ var _symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../symbol/FillSymbol */ "./src/core/render/symbol/FillSymbol.ts");
/* harmony import */ var _symbol_Symbol__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../symbol/Symbol */ "./src/core/render/symbol/Symbol.ts");






/**
 * 渲染方式基类
 */
class Renderer {
    /**
     * 获取随机颜色符号
     * @param type 几何图形类型
     * @return {Symbol} 随机颜色符号
     */
    static getRandomSymbol(type) {
        switch (type) {
            case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point:
                const symbolPoint = new _symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__.PointSymbol();
                symbolPoint.fillStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                symbolPoint.strokeStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                return symbolPoint;
            case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPoint:
                const symbolMultiPoint = new _symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_2__.PointSymbol();
                symbolMultiPoint.fillStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                symbolMultiPoint.strokeStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                return symbolMultiPoint;
            case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polyline:
                const symbolLine = new _symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_3__.LineSymbol();
                symbolLine.strokeStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                return symbolLine;
            case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolyline:
                const symbolMultiLine = new _symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_3__.LineSymbol();
                symbolMultiLine.strokeStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                return symbolMultiLine;
            case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon:
                const symbolFill = new _symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_4__.FillSymbol();
                symbolFill.fillStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                symbolFill.strokeStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                return symbolFill;
            case _geometry_Geometry__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolygon:
                const symbolMultiFill = new _symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_4__.FillSymbol();
                symbolMultiFill.fillStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                symbolMultiFill.strokeStyle = _Color__WEBPACK_IMPORTED_MODULE_1__.Color.random().toString();
                return symbolMultiFill;
        }
    }
    /**
     * 获取该渲染下的Symbol（虚函数）
     * @returns {Symbol} 几何图形符号
     */
    getSymbol(feature) {
        return new _symbol_Symbol__WEBPACK_IMPORTED_MODULE_5__.Symbol();
    }
}


/***/ }),

/***/ "./src/core/render/renderer/SimpleRenderer.ts":
/*!****************************************************!*\
  !*** ./src/core/render/renderer/SimpleRenderer.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SimpleRenderer: () => (/* binding */ SimpleRenderer)
/* harmony export */ });
/* harmony import */ var _Renderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Renderer */ "./src/core/render/renderer/Renderer.ts");

/**
 * 单一渲染
 */
class SimpleRenderer extends _Renderer__WEBPACK_IMPORTED_MODULE_0__.Renderer {
    constructor(type, symbol) {
        super();
        this.symbol = _Renderer__WEBPACK_IMPORTED_MODULE_0__.Renderer.getRandomSymbol(type);
        this.symbol = symbol;
    }
    /**
     * 获取单一渲染下的Symbol
     * @returns
     */
    getSymbol(feature) {
        return this.symbol;
    }
}


/***/ }),

/***/ "./src/core/render/symbol/FillSymbol.ts":
/*!**********************************************!*\
  !*** ./src/core/render/symbol/FillSymbol.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FillSymbol: () => (/* binding */ FillSymbol)
/* harmony export */ });
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Symbol */ "./src/core/render/symbol/Symbol.ts");

/**
 * 填充符号
 */
class FillSymbol extends _Symbol__WEBPACK_IMPORTED_MODULE_0__.Symbol {
    constructor(lineWidth = 1, strokeStyle = "ff0000", fillStyle = "#ff000088") {
        super(lineWidth, strokeStyle, fillStyle);
    }
    /**
     * 通过Renderer调用Symbol去绘制面类型几何图像
     * @param ctx Canvas上下文
     * @param screenCoordinates 几何图形屏幕坐标
     */
    draw(ctx, screenCoordinates) {
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.resetTransform();
        ctx.beginPath();
        screenCoordinates.forEach(ring => {
            ring.forEach((point, index) => {
                if (index === 0)
                    ctx.moveTo(point[0], point[1]);
                else
                    ctx.lineTo(point[0], point[1]);
            });
        });
        ctx.closePath();
        ctx.fill("evenodd");
        ctx.stroke();
        ctx.restore();
    }
}


/***/ }),

/***/ "./src/core/render/symbol/LineSymbol.ts":
/*!**********************************************!*\
  !*** ./src/core/render/symbol/LineSymbol.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineDashSymbol: () => (/* binding */ LineDashSymbol),
/* harmony export */   LineSymbol: () => (/* binding */ LineSymbol)
/* harmony export */ });
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Symbol */ "./src/core/render/symbol/Symbol.ts");

/**
 * 线状符号
 */
class LineSymbol extends _Symbol__WEBPACK_IMPORTED_MODULE_0__.Symbol {
    constructor(lineWidth = 1, strokeStyle = "ff0000") {
        super(lineWidth, strokeStyle);
    }
    /**
     * 通过Renderer调用Symbol去绘制线类型几何图像
     * @param ctx Canvas画笔
     * @param screenCoordinates 屏幕坐标
     */
    draw(ctx, screenCoordinates) {
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.resetTransform();
        ctx.beginPath();
        screenCoordinates.forEach((point, index) => {
            if (index === 0)
                ctx.moveTo(point[0], point[1]);
            else
                ctx.lineTo(point[0], point[1]);
        });
        ctx.stroke();
        ctx.restore();
    }
}
class LineDashSymbol extends LineSymbol {
    constructor(lineWidth = 1, strokeStyle = "ff0000") {
        super(lineWidth, strokeStyle);
    }
    draw(ctx, screenCoordinates) {
        ctx.save();
        // 绘制绿色的实线
        ctx.strokeStyle = this.strokeStyle; // 设置绿色
        ctx.lineWidth = this.lineWidth;
        ctx.resetTransform();
        ctx.beginPath();
        screenCoordinates.forEach((point, index) => {
            if (index === 0)
                ctx.moveTo(point[0], point[1]);
            else
                ctx.lineTo(point[0], point[1]);
        });
        ctx.stroke();
        // 绘制白色的虚线
        ctx.setLineDash([5, 20]); // 设置虚线样式
        ctx.strokeStyle = "#FFFFFF"; // 设置白色
        ctx.beginPath();
        screenCoordinates.forEach((point, index) => {
            if (index === 0)
                ctx.moveTo(point[0], point[1]);
            else
                ctx.lineTo(point[0], point[1]);
        });
        ctx.stroke();
        ctx.restore();
    }
}


/***/ }),

/***/ "./src/core/render/symbol/PointSymbol.ts":
/*!***********************************************!*\
  !*** ./src/core/render/symbol/PointSymbol.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LetterSymbol: () => (/* binding */ LetterSymbol),
/* harmony export */   PointSymbol: () => (/* binding */ PointSymbol),
/* harmony export */   SimpleMarkerSymbol: () => (/* binding */ SimpleMarkerSymbol),
/* harmony export */   SimpleTextSymbol: () => (/* binding */ SimpleTextSymbol)
/* harmony export */ });
/* harmony import */ var _Symbol__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Symbol */ "./src/core/render/symbol/Symbol.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

/**
 * 点状符号
 */
class PointSymbol extends _Symbol__WEBPACK_IMPORTED_MODULE_0__.Symbol {
    constructor(lineWidth = 1, strokeStyle = "ff0000", fillStyle = "#ff000088", radius = 10) {
        super(lineWidth, strokeStyle, fillStyle);
        this.radius = radius;
    }
    /**
     * 通过Renderer调用Symbol去绘制点类型几何图像
     * @param ctx Canvas画笔
     * @param coordinate 屏幕坐标
     */
    draw(ctx, coordinate) {
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.beginPath();
        // keep circle size
        const matrix = ctx.getTransform();
        ctx.resetTransform();
        ctx.arc(coordinate[0], coordinate[1], this.radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    /**
     * 判断点是否在符号范围内
     * @param anchorCoordinate 目标点
     * @param screenCoordinate 符号坐标
     * @returns {boolean} 是否在范围内
     */
    contain(anchorCoordinate, screenCoordinate) {
        if (Math.sqrt((anchorCoordinate[0] - screenCoordinate[0]) * (anchorCoordinate[0] - screenCoordinate[0]) + (anchorCoordinate[1] - screenCoordinate[1]) * (anchorCoordinate[1] - screenCoordinate[1])) <= this.radius)
            return true;
        else
            return false;
    }
}
/**
 * 图标符号
 * @remarks
 * 常用于POI兴趣点的渲染
 */
class SimpleMarkerSymbol extends PointSymbol {
    constructor(url, width, height) {
        super();
        /**
         * 宽
         */
        this.width = 16;
        /**
         * 高
         */
        this.height = 16;
        /**
         * offset，坐标点对应图标的位置
         * 例如，宽16px，高16px，offsetX为-8，offsetY为-8，意味着：
         * 该图标的中心点对应渲染点的坐标。
         */
        this.offsetX = -8;
        /**
         * offset，坐标点对应图标的位置
         * 例如，宽16px，高16px，offsetX为-8，offsetY为-8，意味着：
         * 该图标的中心点对应渲染点的坐标。
         */
        this.offsetY = -8;
        this.url = url.href;
        this.width = width ? width : 16;
        this.height = height ? height : 16;
        this.offsetX = width / -2;
        this.offsetY = height / -2;
    }
    /**
     * 记录是否已完成异步图标加载
     */
    get loaded() {
        return this._loaded;
    }
    /**
     * 异步加载图标
     * @return {Color} 生成随机色带
     */
    load() {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                createImageBitmap(img).then(icon => {
                    this.icon = icon;
                    this._loaded = true;
                    resolve(icon);
                }, err => reject(err));
            };
            img.onerror = reject;
            img.src = this.url;
        });
    }
    /**
     * 绘制图标
     * @remarks 注意异步加载
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} screenCoordinate - 屏幕坐标
     */
    draw(ctx, screenCoordinate) {
        const [screenX, screenY] = screenCoordinate;
        if (!this._loaded) {
            this.image = new Image();
            this.image.src = this.url;
            this._loaded = true;
        }
        ;
        ctx.save();
        //const matrix = (ctx as any).getTransform();
        //keep size
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        //请对应参考offset属性的描述内容
        ctx.drawImage(this.icon || this.image, screenX + this.offsetX, screenY + this.offsetY, this.width, this.height);
        ctx.restore();
    }
    /**
     * 判断鼠标交互位置是否在符号范围内
     **/
    contain(anchorCoordinate, screenCoordinate) {
        const [anchorX, anchorY] = anchorCoordinate;
        const [screenX, screenY] = screenCoordinate;
        return screenX >= (anchorX + this.offsetX) && screenX <= (anchorX + this.offsetX + this.width) && screenY >= (anchorY + this.offsetY) && screenY <= (anchorY + this.offsetY + this.height);
    }
    static create(url, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            const marker = new SimpleMarkerSymbol(url, width, height);
            yield marker.load();
            return marker;
        });
    }
}
/**
 * 字符符号
 * @remarks
 * 中英文皆可，注意控制长度，推荐单个字符
 */
class LetterSymbol extends PointSymbol {
    constructor({ lineWidth, strokeStyle, fillStyle, letter, radius, fontColor, fontFamily, fontSize, fontWeight }) {
        super(lineWidth, strokeStyle, fillStyle);
        /**
         * 外圈半径
         */
        this.radius = 10;
        /**
         * 字符，中英文皆可，推荐单个字符
         */
        this.letter = "";
        /**
         * 字体颜色
         */
        this.fontColor = "#ff0000";
        /**
         * 字体大小
         */
        this.fontSize = 12;
        /**
         * 字体
         */
        this.fontFamily = "YaHei";
        /**
         * 字体粗细
         */
        this.fontWeight = "Bold";
        this.letter = letter ? letter : "";
        this.radius = radius ? radius : 10;
        this.fontColor = fontColor ? fontColor : "#ff0000";
        this.fontFamily = fontFamily ? fontFamily : "YaHei";
        this.fontSize = fontSize ? fontSize : 12;
        this.fontWeight = fontWeight ? fontWeight : "Bold";
    }
    /**
     * 绘制字符符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     */
    draw(ctx, screenCoordinate) {
        const [screenX, screenY] = screenCoordinate;
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath(); //Start path
        //keep size
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        //绘制外圈
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = this.fontColor;
        ctx.font = this.fontSize + "px/1 " + this.fontFamily + " " + this.fontWeight;
        //绘制字符
        ctx.fillText(this.letter, screenX, screenY);
        ctx.restore();
    }
    /**
     * 判断鼠标交互位置是否在符号范围内
     **/
    contain(anchorCoordinate, screenCoordinate) {
        const [anchorX, anchorY] = anchorCoordinate;
        const [screenX, screenY] = screenCoordinate;
        return Math.sqrt((anchorX - screenX) * (anchorX - screenX) + (anchorY - screenY) * (anchorY - screenY)) <= this.radius;
    }
}
/**
 * 文本符号
 * @remarks
 * 常用于文本标注
 */
class SimpleTextSymbol extends _Symbol__WEBPACK_IMPORTED_MODULE_0__.Symbol {
    constructor() {
        super(...arguments);
        /**
         * 边框宽
         */
        this.lineWidth = 3;
        /**
         * 边框色
         */
        this.strokeStyle = "#ff0000"; //#ffffff
        /**
         * 填充色
         */
        this.fillStyle = "#ffffff"; //#ffffff
        /**
         * X偏移
         */
        this.offsetX = 0;
        /**
         * Y偏移
         */
        this.offsetY = 1;
        /**
         * 周边留白
         */
        this.padding = 5;
        /**
         * 字体颜色
         */
        this.fontColor = "#ff0000";
        /**
         * 字体大小
         */
        this.fontSize = 12;
        /**
         * 字体
         */
        this.fontFamily = "YaHei";
        /**
         * 字体粗细
         */
        this.fontWeight = "Bold";
        /**
         * 放置位置
         */
        this.placement = "BOTTOM"; //BOTTOM TOP LEFT RIGHT
        /**
         * 自动调整位置
         */
        this.auto = false;
        /**
         * 标注点符号的宽度
         */
        this.pointSymbolWidth = 0;
        /**
         * 标注点符号的高度
         */
        this.pointSymbolHeight = 0;
    }
    /**
     * 自动调整位置
     * @remarks 按逆时针方向寻找合适位置
     */
    replacement() {
        if (this.auto) {
            switch (this.placement) {
                case "BOTTOM":
                    this.placement = "RIGHT";
                    break;
                case "RIGHT":
                    this.placement = "TOP";
                    break;
                case "TOP":
                    this.placement = "LEFT";
                    break;
                case "LEFT":
                    this.placement = "BOTTOM";
                    break;
            }
        }
    }
    /**
     * 复制符号
     */
    copy(symbol) {
        const copiedSymbol = this.deepCopy(symbol);
        Object.assign(this, copiedSymbol);
    }
    deepCopy(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const copy = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }
        return copy;
    }
}


/***/ }),

/***/ "./src/core/render/symbol/Symbol.ts":
/*!******************************************!*\
  !*** ./src/core/render/symbol/Symbol.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Symbol: () => (/* binding */ Symbol)
/* harmony export */ });
/**
 * 几何图形符号
 */
class Symbol {
    constructor(lineWidth = 1, strokeStyle = "ff0000", fillStyle = "#ff000088") {
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }
}


/***/ }),

/***/ "./src/core/utils/CreateElement.ts":
/*!*****************************************!*\
  !*** ./src/core/utils/CreateElement.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createElementByObj: () => (/* binding */ createElementByObj),
/* harmony export */   createElementByURL: () => (/* binding */ createElementByURL)
/* harmony export */ });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../index */ "./src/index.ts");
/* harmony import */ var _element_FeatureClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../element/FeatureClass */ "./src/core/element/FeatureClass.ts");
/* harmony import */ var _layer_FeatureLayer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layer/FeatureLayer */ "./src/core/layer/FeatureLayer.ts");
/* harmony import */ var _Loader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Loader */ "./src/core/utils/Loader.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




function createElementByURL(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        const fc = _element_FeatureClass__WEBPACK_IMPORTED_MODULE_1__.FeatureClass.fromGeoJson({
            name: obj.name ? obj.name : "",
            type: obj.type,
            data: yield _Loader__WEBPACK_IMPORTED_MODULE_3__.Loader.loadGeoJson(obj.url),
            alias: obj.alias ? obj.alias : "",
            description: obj.description ? obj.description : ""
        });
        const renderer = obj.renderer ? obj.renderer : new _index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(obj.type);
        const fl = new _layer_FeatureLayer__WEBPACK_IMPORTED_MODULE_2__.FeatureLayer(fc, renderer);
        fl.name = obj.name;
        fl.description = obj.description;
        return fl;
    });
}
function createElementByObj(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        const fc = _element_FeatureClass__WEBPACK_IMPORTED_MODULE_1__.FeatureClass.fromGeoJson({
            name: obj.name ? obj.name : "",
            type: obj.type,
            data: obj.data,
            alias: obj.alias ? obj.alias : "",
            description: obj.description ? obj.description : ""
        });
        const renderer = obj.renderer ? obj.renderer : new _index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(obj.type);
        const fl = new _layer_FeatureLayer__WEBPACK_IMPORTED_MODULE_2__.FeatureLayer(fc, renderer);
        fl.name = obj.name;
        fl.description = obj.description;
        return fl;
    });
}


/***/ }),

/***/ "./src/core/utils/Loader.ts":
/*!**********************************!*\
  !*** ./src/core/utils/Loader.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Loader: () => (/* binding */ Loader)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Loader {
    static loadGeoJson(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(path, { method: "GET" });
            const json = yield response.json();
            return json;
        });
    }
}


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CategoryRenderer: () => (/* reexport safe */ _core_render_renderer_CategoryRenderer__WEBPACK_IMPORTED_MODULE_17__.CategoryRenderer),
/* harmony export */   CategoryRendererItem: () => (/* reexport safe */ _core_render_renderer_CategoryRenderer__WEBPACK_IMPORTED_MODULE_17__.CategoryRendererItem),
/* harmony export */   ClassRenderer: () => (/* reexport safe */ _core_render_renderer_ClassRenderer__WEBPACK_IMPORTED_MODULE_16__.ClassRenderer),
/* harmony export */   Collision: () => (/* reexport safe */ _core_label_collision__WEBPACK_IMPORTED_MODULE_21__.Collision),
/* harmony export */   Color: () => (/* reexport safe */ _core_render_Color__WEBPACK_IMPORTED_MODULE_22__.Color),
/* harmony export */   CoverCollision: () => (/* reexport safe */ _core_label_collision__WEBPACK_IMPORTED_MODULE_21__.CoverCollision),
/* harmony export */   Extent: () => (/* reexport safe */ _core_render_Extent__WEBPACK_IMPORTED_MODULE_11__.Extent),
/* harmony export */   FeatureClass: () => (/* reexport safe */ _core_element_FeatureClass__WEBPACK_IMPORTED_MODULE_10__.FeatureClass),
/* harmony export */   FeatureLayer: () => (/* reexport safe */ _core_layer_FeatureLayer__WEBPACK_IMPORTED_MODULE_9__.FeatureLayer),
/* harmony export */   Field: () => (/* reexport safe */ _core_render_Field__WEBPACK_IMPORTED_MODULE_12__.Field),
/* harmony export */   FieldDataType: () => (/* reexport safe */ _core_render_Field__WEBPACK_IMPORTED_MODULE_12__.FieldDataType),
/* harmony export */   FillSymbol: () => (/* reexport safe */ _core_render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_18__.FillSymbol),
/* harmony export */   Geometry: () => (/* reexport safe */ _core_geometry_Geometry__WEBPACK_IMPORTED_MODULE_1__.Geometry),
/* harmony export */   GeometryType: () => (/* reexport safe */ _core_geometry_Geometry__WEBPACK_IMPORTED_MODULE_1__.GeometryType),
/* harmony export */   Label: () => (/* reexport safe */ _core_label_Label__WEBPACK_IMPORTED_MODULE_13__.Label),
/* harmony export */   LetterSymbol: () => (/* reexport safe */ _core_render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_20__.LetterSymbol),
/* harmony export */   LineDashSymbol: () => (/* reexport safe */ _core_render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_19__.LineDashSymbol),
/* harmony export */   LineSymbol: () => (/* reexport safe */ _core_render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_19__.LineSymbol),
/* harmony export */   Loader: () => (/* reexport safe */ _core_utils_Loader__WEBPACK_IMPORTED_MODULE_14__.Loader),
/* harmony export */   Map: () => (/* reexport safe */ _core_Map__WEBPACK_IMPORTED_MODULE_0__.Map),
/* harmony export */   MultiPoint: () => (/* reexport safe */ _core_geometry_MultiPoint__WEBPACK_IMPORTED_MODULE_5__.MultiPoint),
/* harmony export */   MultiPolygon: () => (/* reexport safe */ _core_geometry_MultiPolygon__WEBPACK_IMPORTED_MODULE_7__.MultiPolygon),
/* harmony export */   MultiPolyline: () => (/* reexport safe */ _core_geometry_MultiPolyline__WEBPACK_IMPORTED_MODULE_6__.MultiPolyline),
/* harmony export */   NullCollision: () => (/* reexport safe */ _core_label_collision__WEBPACK_IMPORTED_MODULE_21__.NullCollision),
/* harmony export */   Point: () => (/* reexport safe */ _core_geometry_Point__WEBPACK_IMPORTED_MODULE_2__.Point),
/* harmony export */   PointSymbol: () => (/* reexport safe */ _core_render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_20__.PointSymbol),
/* harmony export */   Polygon: () => (/* reexport safe */ _core_geometry_Polygon__WEBPACK_IMPORTED_MODULE_4__.Polygon),
/* harmony export */   Polyline: () => (/* reexport safe */ _core_geometry_Polyline__WEBPACK_IMPORTED_MODULE_3__.Polyline),
/* harmony export */   SimpleCollision: () => (/* reexport safe */ _core_label_collision__WEBPACK_IMPORTED_MODULE_21__.SimpleCollision),
/* harmony export */   SimpleMarkerSymbol: () => (/* reexport safe */ _core_render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_20__.SimpleMarkerSymbol),
/* harmony export */   SimpleRenderer: () => (/* reexport safe */ _core_render_renderer_SimpleRenderer__WEBPACK_IMPORTED_MODULE_15__.SimpleRenderer),
/* harmony export */   SimpleTextSymbol: () => (/* reexport safe */ _core_render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_20__.SimpleTextSymbol),
/* harmony export */   Tiles: () => (/* reexport safe */ _core_layer_Tiles__WEBPACK_IMPORTED_MODULE_8__.Tiles),
/* harmony export */   createElementByObj: () => (/* reexport safe */ _core_utils_CreateElement__WEBPACK_IMPORTED_MODULE_23__.createElementByObj),
/* harmony export */   createElementByURL: () => (/* reexport safe */ _core_utils_CreateElement__WEBPACK_IMPORTED_MODULE_23__.createElementByURL)
/* harmony export */ });
/* harmony import */ var _core_Map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/Map */ "./src/core/Map.ts");
/* harmony import */ var _core_geometry_Geometry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./core/geometry/Geometry */ "./src/core/geometry/Geometry.ts");
/* harmony import */ var _core_geometry_Point__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./core/geometry/Point */ "./src/core/geometry/Point.ts");
/* harmony import */ var _core_geometry_Polyline__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./core/geometry/Polyline */ "./src/core/geometry/Polyline.ts");
/* harmony import */ var _core_geometry_Polygon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./core/geometry/Polygon */ "./src/core/geometry/Polygon.ts");
/* harmony import */ var _core_geometry_MultiPoint__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./core/geometry/MultiPoint */ "./src/core/geometry/MultiPoint.ts");
/* harmony import */ var _core_geometry_MultiPolyline__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./core/geometry/MultiPolyline */ "./src/core/geometry/MultiPolyline.ts");
/* harmony import */ var _core_geometry_MultiPolygon__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./core/geometry/MultiPolygon */ "./src/core/geometry/MultiPolygon.ts");
/* harmony import */ var _core_layer_Tiles__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./core/layer/Tiles */ "./src/core/layer/Tiles.ts");
/* harmony import */ var _core_layer_FeatureLayer__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./core/layer/FeatureLayer */ "./src/core/layer/FeatureLayer.ts");
/* harmony import */ var _core_element_FeatureClass__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./core/element/FeatureClass */ "./src/core/element/FeatureClass.ts");
/* harmony import */ var _core_render_Extent__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./core/render/Extent */ "./src/core/render/Extent.ts");
/* harmony import */ var _core_render_Field__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./core/render/Field */ "./src/core/render/Field.ts");
/* harmony import */ var _core_label_Label__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./core/label/Label */ "./src/core/label/Label.ts");
/* harmony import */ var _core_utils_Loader__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./core/utils/Loader */ "./src/core/utils/Loader.ts");
/* harmony import */ var _core_render_renderer_SimpleRenderer__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./core/render/renderer/SimpleRenderer */ "./src/core/render/renderer/SimpleRenderer.ts");
/* harmony import */ var _core_render_renderer_ClassRenderer__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./core/render/renderer/ClassRenderer */ "./src/core/render/renderer/ClassRenderer.ts");
/* harmony import */ var _core_render_renderer_CategoryRenderer__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./core/render/renderer/CategoryRenderer */ "./src/core/render/renderer/CategoryRenderer.ts");
/* harmony import */ var _core_render_symbol_FillSymbol__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./core/render/symbol/FillSymbol */ "./src/core/render/symbol/FillSymbol.ts");
/* harmony import */ var _core_render_symbol_LineSymbol__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./core/render/symbol/LineSymbol */ "./src/core/render/symbol/LineSymbol.ts");
/* harmony import */ var _core_render_symbol_PointSymbol__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./core/render/symbol/PointSymbol */ "./src/core/render/symbol/PointSymbol.ts");
/* harmony import */ var _core_label_collision__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./core/label/collision */ "./src/core/label/collision.ts");
/* harmony import */ var _core_render_Color__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./core/render/Color */ "./src/core/render/Color.ts");
/* harmony import */ var _core_utils_CreateElement__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./core/utils/CreateElement */ "./src/core/utils/CreateElement.ts");


























/***/ }),

/***/ "./view/main.ts":
/*!**********************!*\
  !*** ./view/main.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_init_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style/init.css */ "./view/style/init.css");
/* harmony import */ var _style_main_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style/main.css */ "./view/style/main.css");
/* harmony import */ var _src_index__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../src/index */ "./src/index.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./view/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 设置地图
        const map = new _src_index__WEBPACK_IMPORTED_MODULE_2__.Map({
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
        (0,_utils__WEBPACK_IMPORTED_MODULE_3__.initMap)(map);
        // 获取搜索框和提示栏
        const startInput = document.getElementById('start-input');
        const endInput = document.getElementById('end-input');
        const startResults = document.getElementById('start-results');
        const endResults = document.getElementById('end-results');
        // 获取按钮元素和内部圆形部分元素
        const toggleButton = document.getElementById('toggleButton');
        const toggleButtonInner = toggleButton.querySelector('.toggle-button-inner');
        const toggleText = document.querySelector(".toggle-button-text");
        const searchButton = document.getElementById('search-button');
        // 站点信息
        const station_info = document.querySelector("#station_info");
        // 搜索框事件监听 + 防抖 -> 发送请求获得提示词
        const searchPOIDebounced = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.debounce)(_utils__WEBPACK_IMPORTED_MODULE_3__.searchPOI, 1000);
        startInput.addEventListener('focus', function () {
            if (startInput.value !== "") {
                searchPOIDebounced(startInput.value, function (data) {
                    (0,_utils__WEBPACK_IMPORTED_MODULE_3__.populateResults)(startResults, data);
                    startResults.style.display = "block";
                });
            }
        });
        endInput.addEventListener('focus', function () {
            if (endInput.value !== "") {
                searchPOIDebounced(endInput.value, function (data) {
                    (0,_utils__WEBPACK_IMPORTED_MODULE_3__.populateResults)(endResults, data);
                    endResults.style.display = "block";
                });
            }
        });
        // 提示栏事件监听 -> 防止提示词
        startResults.addEventListener("click", function (e) {
            const optionElem = e.target;
            startInput.value = optionElem.innerText;
        });
        endResults.addEventListener("click", function (e) {
            const optionElem = e.target;
            endInput.value = optionElem.innerText;
        });
        // 搜索框事件监听 -> 失去焦点，关闭提示栏
        startInput.addEventListener("blur", function (e) {
            setTimeout(function () {
                startResults.style.display = "none";
            }, 100);
        });
        endInput.addEventListener("blur", function (e) {
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
                url = "./search-bus-road";
            }
            else {
                toggleText.textContent = '自驾模式';
                url = "./search-car-road";
            }
        });
        // 导航定位发送请求
        searchButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
            const startValue = startInput.value;
            const endValue = endInput.value;
            try {
                const res = yield (0,_utils__WEBPACK_IMPORTED_MODULE_3__.sendRequest)(url, {
                    start: startValue,
                    end: endValue
                });
                (0,_utils__WEBPACK_IMPORTED_MODULE_3__.remove)(map);
                station_info.innerText = "";
                if (url === "./search-bus-road") {
                    (0,_utils__WEBPACK_IMPORTED_MODULE_3__.showBusRoad)(map, res.start, res.end, res.line, res.bus_station, res.turn_line);
                    // 展示站点信息
                    let text = "站点：";
                    let line_name = "";
                    let station_name = "";
                    for (const station of res.bus_station.features) {
                        if (line_name === station.properties.line_name) {
                            station_name = station.properties.name;
                            text += "\n\t\t'" + station.properties.name + "'";
                        }
                        else {
                            line_name = station.properties.line_name;
                            if (station_name)
                                text += "\n\t\t'" + station.properties.name + "'";
                            text += "\n - [" + station.properties.line_name + "]\n\t\t'" + station.properties.name + "'";
                        }
                    }
                    station_info.innerText = text;
                }
                else {
                    (0,_utils__WEBPACK_IMPORTED_MODULE_3__.showDriveCarPath)(map, res.start, res.end, res.line);
                }
            }
            catch (err) {
                console.error(err);
            }
        }));
    });
}
;
window.onload = main;


/***/ }),

/***/ "./view/utils.ts":
/*!***********************!*\
  !*** ./view/utils.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   initMap: () => (/* binding */ initMap),
/* harmony export */   populateResults: () => (/* binding */ populateResults),
/* harmony export */   remove: () => (/* binding */ remove),
/* harmony export */   searchPOI: () => (/* binding */ searchPOI),
/* harmony export */   sendRequest: () => (/* binding */ sendRequest),
/* harmony export */   showBusRoad: () => (/* binding */ showBusRoad),
/* harmony export */   showDriveCarPath: () => (/* binding */ showDriveCarPath)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/lib/axios.js");
/* harmony import */ var _src_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/index */ "./src/index.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * 关键字模糊查询POI
 * @param keyword 关键字
 * @param callback 回调函数callback(data)
 */
function searchPOI(keyword, callback) {
    axios__WEBPACK_IMPORTED_MODULE_1__["default"].get('/search-poi', {
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
function populateResults(resultsElement, data) {
    resultsElement.innerHTML = '';
    data.forEach(function (poi) {
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
function sendRequest(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios__WEBPACK_IMPORTED_MODULE_1__["default"].get(url, { params });
            return response.data;
        }
        catch (error) {
            // 处理请求发生的错误
            throw error;
        }
    });
}
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
function remove(map) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function showDriveCarPath(map, start, end, line) {
    return __awaiter(this, void 0, void 0, function* () {
        // res 为最短路径的geojson
        const road = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            name: "最短路径",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polyline,
            data: line,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polyline, new _src_index__WEBPACK_IMPORTED_MODULE_0__.LineDashSymbol(8, "#45ff0d"))
        });
        map.pushLayer(road);
        const startPoint = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            name: "起始点",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point,
            data: start,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point, 
            // await loong.SimpleMarkerSymbol.create(
            //     new URL("./static/marker.svg", import.meta.url),
            //     30, 30
            // )
            new _src_index__WEBPACK_IMPORTED_MODULE_0__.LetterSymbol({
                lineWidth: 0.2,
                letter: "始",
                fontColor: "#000000",
                strokeStyle: "#ffca28",
                fillStyle: "#ffca28",
                radius: 12,
                fontFamily: "楷体",
                fontSize: 12
            }))
        });
        map.pushLayer(startPoint);
        const endPoint = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            name: "终点",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point,
            data: end,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point, 
            // new loong.LetterSymbol({
            //     lineWidth: 0.2,
            //     letter: "终",
            //     fontColor: "#000000",
            //     fillStyle: "#ffffff",
            //     radius: 15,
            //     fontSize: 16,
            //     fontFamily: "微软雅黑"
            // })
            yield _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleMarkerSymbol.create(new URL(/* asset import */ __webpack_require__(/*! ./static/img/marker.svg */ "./view/static/img/marker.svg"), __webpack_require__.b), 30, 30))
        });
        map.pushLayer(endPoint);
    });
}
function showBusRoad(map, start, end, line, bus_station, turn_line) {
    return __awaiter(this, void 0, void 0, function* () {
        const road = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            name: "最短路径",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polyline,
            data: line,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polyline, new _src_index__WEBPACK_IMPORTED_MODULE_0__.LineDashSymbol(8, "#1677d2"))
        });
        const startPoint = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            name: "起始点",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point,
            data: start,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point, 
            // await loong.SimpleMarkerSymbol.create(
            //     new URL("./static/marker.svg", import.meta.url),
            //     30, 30
            // )
            new _src_index__WEBPACK_IMPORTED_MODULE_0__.LetterSymbol({
                lineWidth: 0.2,
                letter: "S",
                fontColor: "#000000",
                strokeStyle: "#ffca28",
                fillStyle: "#ffca28",
                radius: 12,
                fontFamily: "微软雅黑",
                fontSize: 16
            }))
        });
        const endPoint = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            name: "终点",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point,
            data: end,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point, 
            // new loong.LetterSymbol({
            //     lineWidth: 0.2,
            //     letter: "终",
            //     fontColor: "#000000",
            //     fillStyle: "#ffffff",
            //     radius: 15,
            //     fontSize: 16,
            //     fontFamily: "微软雅黑"
            // })
            yield _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleMarkerSymbol.create(new URL(/* asset import */ __webpack_require__(/*! ./static/img/marker.svg */ "./view/static/img/marker.svg"), __webpack_require__.b), 30, 30))
        });
        const points = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPoint,
            data: bus_station,
            name: "公交站点",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPoint, new _src_index__WEBPACK_IMPORTED_MODULE_0__.PointSymbol(1, "#000000", "#ffffff", 6))
        });
        const coords = turn_line.map((p) => {
            return [p.x, p.y];
        });
        const turn_point_data = {
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
        const turn_point = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByObj({
            data: turn_point_data,
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point,
            name: "中转点",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Point, new _src_index__WEBPACK_IMPORTED_MODULE_0__.LetterSymbol({
                lineWidth: 0.2,
                letter: "转",
                fontColor: "#000000",
                strokeStyle: "#8bc34a",
                fillStyle: "#8bc34a",
                radius: 12,
                fontFamily: "微软雅黑",
                fontSize: 16
            }))
        });
        map.pushLayer(road);
        map.pushLayer(points);
        map.pushLayer(endPoint);
        map.pushLayer(startPoint);
        // map.pushLayer(turn_point);
    });
}
function initMap(map) {
    return __awaiter(this, void 0, void 0, function* () {
        // 地图加载
        const road_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/line.geojson */ "./view/static/map/line.geojson"), __webpack_require__.b),
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polyline,
            name: "路网数据",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polyline, new _src_index__WEBPACK_IMPORTED_MODULE_0__.LineSymbol(3, "#ffebbe"))
        });
        const bound1_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/PARK2.geojson */ "./view/static/map/PARK2.geojson"), __webpack_require__.b),
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon,
            name: "边界1",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon, new _src_index__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(0.4, "#f0e9e2", "#f0e9e2"))
        });
        const bound_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/bound.geojson */ "./view/static/map/bound.geojson"), __webpack_require__.b),
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon,
            name: "边界",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon, new _src_index__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(2, "#d2e6bf", "#d2e6bf"))
        });
        const water_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/water.geojson */ "./view/static/map/water.geojson"), __webpack_require__.b),
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolygon,
            name: "水面",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolygon, new _src_index__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(1, "#d2e6bf", "#d2e6bf"))
        });
        const water1_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/water1.geojson */ "./view/static/map/water1.geojson"), __webpack_require__.b),
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolygon,
            name: "水面",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolygon, new _src_index__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(2, "#76cff0", "#76cff0"))
        });
        const highway_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/highway.geojson */ "./view/static/map/highway.geojson"), __webpack_require__.b),
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolyline,
            name: "高速公路",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolyline, new _src_index__WEBPACK_IMPORTED_MODULE_0__.LineSymbol(3, "#c95159"))
        });
        const shq_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/shq.geojson */ "./view/static/map/shq.geojson"), __webpack_require__.b),
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolygon,
            name: "生活区",
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.MultiPolygon, new _src_index__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(3, "#f1ebd6", "#f1ebd6"))
        });
        const jxq_fl = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/studyArea.geojson */ "./view/static/map/studyArea.geojson"), __webpack_require__.b),
            name: "教学区",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon, new _src_index__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(1, "#cfd3da", "#cfd3da"))
        });
        const schoolName = yield _src_index__WEBPACK_IMPORTED_MODULE_0__.createElementByURL({
            url: new URL(/* asset import */ __webpack_require__(/*! ./static/map/school_name.geojson */ "./view/static/map/school_name.geojson"), __webpack_require__.b),
            name: "区域",
            type: _src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon,
            renderer: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleRenderer(_src_index__WEBPACK_IMPORTED_MODULE_0__.GeometryType.Polygon, new _src_index__WEBPACK_IMPORTED_MODULE_0__.FillSymbol(0.1, "rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0)"))
        });
        schoolName.labeled = true;
        const symbol = new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleTextSymbol();
        symbol.auto = true;
        symbol.strokeStyle = "rgba(255, 0, 0, 0)";
        symbol.fillStyle = "rgba(255, 0, 0, 0)";
        symbol.fontColor = "#000000";
        symbol.fontSize = 15;
        schoolName.label = new _src_index__WEBPACK_IMPORTED_MODULE_0__.Label({
            field: new _src_index__WEBPACK_IMPORTED_MODULE_0__.Field("name"),
            collision: new _src_index__WEBPACK_IMPORTED_MODULE_0__.SimpleCollision(),
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
    });
}


/***/ }),

/***/ "./view/static/img/marker.svg":
/*!************************************!*\
  !*** ./view/static/img/marker.svg ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/4bae05f1.svg";

/***/ }),

/***/ "./view/static/map/PARK2.geojson":
/*!***************************************!*\
  !*** ./view/static/map/PARK2.geojson ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/5c534088.geojson";

/***/ }),

/***/ "./view/static/map/bound.geojson":
/*!***************************************!*\
  !*** ./view/static/map/bound.geojson ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/b52a8bd2.geojson";

/***/ }),

/***/ "./view/static/map/highway.geojson":
/*!*****************************************!*\
  !*** ./view/static/map/highway.geojson ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/325c1b9a.geojson";

/***/ }),

/***/ "./view/static/map/line.geojson":
/*!**************************************!*\
  !*** ./view/static/map/line.geojson ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/4234f220.geojson";

/***/ }),

/***/ "./view/static/map/school_name.geojson":
/*!*********************************************!*\
  !*** ./view/static/map/school_name.geojson ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/4e7d45a8.geojson";

/***/ }),

/***/ "./view/static/map/shq.geojson":
/*!*************************************!*\
  !*** ./view/static/map/shq.geojson ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/d73e09a8.geojson";

/***/ }),

/***/ "./view/static/map/studyArea.geojson":
/*!*******************************************!*\
  !*** ./view/static/map/studyArea.geojson ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/66a11504.geojson";

/***/ }),

/***/ "./view/static/map/water.geojson":
/*!***************************************!*\
  !*** ./view/static/map/water.geojson ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/7c46bba4.geojson";

/***/ }),

/***/ "./view/static/map/water1.geojson":
/*!****************************************!*\
  !*** ./view/static/map/water1.geojson ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "media/628ed48a.geojson";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl + "../";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunknavigation_gz"] = self["webpackChunknavigation_gz"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_axios_lib_axios_js"], () => (__webpack_require__("./view/main.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map