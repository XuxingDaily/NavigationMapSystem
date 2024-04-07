import { scaleGeometry } from "./interaction/Interaction";
import { Extent } from "./render/Extent";
import { Layer } from "./layer/Layer";
import { Tiles } from "./layer/Tiles";
import { FeatureLayer } from "../index";

interface map {
    /**
     * 地图容器Div的ID
     */
    target: string,
    /**
     * 图层集
     */
    layers?: Layer[],
    zoom?: number,
    tile?: Tiles,
    minZoom?: number,
    maxZoom?: number
}

/**
 * 地图
 */
export class Map {
    public constructor(config: map) {
        // 传入参数
        this._container = document.getElementById(config.target) as HTMLDivElement;
        // 动态创建 canvas 调整高宽
        this._canvas = document.createElement("canvas");
        this._canvas.style.cssText = "position: absolute; height: 100vh; width: 100vw;";
        this._canvas.width = this._container.clientWidth;
        this._canvas.height = this._container.clientHeight;
        this._container.appendChild(this._canvas);
        this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;

        this._layers = config.layers ? config.layers : [];
        this._zoom = config.zoom != null ? config.zoom : 3;
        this._minZoom = config.minZoom != null ? config.minZoom : 3;
        this._maxZoom = config.maxZoom != null ? config.maxZoom : 20;

        this._layers.forEach(layer => {
            layer.minZoom = this._minZoom;
            layer.maxZoom = this._maxZoom;
        })

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
        } else {
            this.setView(this._zoom, this._layerExtent);
        }

        // 获取此时的可视区范围（作渲染使用）
        this._viewExtent = this.getViewExtent();
        // 添加事件监听
        this._addEventListener();
    }

    /**
     * 地图容器
     */
    public _container: HTMLDivElement;
    /**
     * 一个地图框
     */
    private _canvas: HTMLCanvasElement;
    /**
     * Canvas绘图上下文
     * @remarks 记录了转移矩阵等信息
     */
    private _ctx: CanvasRenderingContext2D;
    /**
     * 图层数组
     */
    private _layers: Layer[];
    /**
     * Canvas中心点的地理坐标
     * @remarks 最初为图层中心点
     */
    private _center: number[];
    /**
     * 可视区范围
     */
    private _viewExtent: Extent;
    /**
     * 图层范围 - 所有Layer的最大Extent
     */
    private _layerExtent: Extent;
    /**
     * 瓦片地图
     */
    private _tile: Tiles;
    /**
     * 层级
     */
    private _zoom: number;
    /**
     * 最小层级
     */
    private _minZoom: number;
    /**
     * 最大层级
     */
    private _maxZoom: number;

    public get container() {
        return this._container;
    }

    public get ctx(): CanvasRenderingContext2D {
        return this._ctx;
    }

    public set ctx(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    public get center(): number[] {
        return this._center;
    }

    public get zoom() {
        return this._zoom;
    }

    public get minZoom() {
        return this._minZoom;
    }
    public set minZoom(zoom: number) {
        this._minZoom = zoom;
    }
    public get maxZoom() {
        return this._maxZoom;
    }
    public set maxZoom(zoom: number) {
        this._maxZoom = zoom;
    }

    /**
     * 回调函数
     * @remarks 用于存在其他对象需要和Map一起调用回调函数的时候
     */
    private _events: any = {
        move: [],
        extent: []
    };

    public setTile(tile: Tiles) {
        this._tile = tile;
        this.setView(this._zoom, tile.extent);
    }

    /**
     * 设置栅格瓦片地址
     * @param url 
     */
    public setTileURL(url: string): void {
        this._tile.url = url;
        this._tile.draw();
    }

    /**
     * 获取全部图层的最大Extent
     * @returns 最大Extent
     */
    public getLayerExtent(): Extent {
        const extent_top = Math.max(...(this._layers.map(layer => { return (layer as any).extent.ymax; })));
        const extent_bottom = Math.min(...(this._layers.map(layer => { return (layer as any).extent.ymin; })));
        const extent_left = Math.min(...(this._layers.map(layer => { return (layer as any).extent.xmin; })));
        const extent_right = Math.max(...(this._layers.map(layer => { return (layer as any).extent.xmax; })));
        return new Extent(extent_top, extent_bottom, extent_left, extent_right);
    }

    /**
     * 获取 Extent 的中心点 [x, y]
     * @param extent [x, y]
     * @returns 
     */
    public getCenter(extent: Extent): number[] {
        return [(extent.xmax + extent.xmin) / 2, (extent.ymax + extent.ymin) / 2];
    }

    /**
     * 设置转换矩阵
     * @param extent 图层范围
     * @remarks 视觉中心点为 this.center
     */
    public setView(zoom: number = this._zoom, extent?: Extent): void {
        this._zoom = Math.max(this._minZoom, Math.min(this._maxZoom, zoom));

        const ex = extent ? extent : this.getLayerExtent();
        const center = this.getCenter(ex);
        const 
            a = this._canvas.height / (ex.ymax - ex.ymin) * ex.xscale,
            d = this._canvas.height / (ex.ymax - ex.ymin) * ex.yscale,
            e = this._container.clientWidth / 2 - a * center[0],
            f = this._canvas.clientHeight / 2 - d * center[1];
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
    public getViewExtent(): Extent {
        const matrix = this._ctx.getTransform();
        const
            x1: number = (0 - matrix.e) / matrix.a,
            y1: number = (0 - matrix.f) / matrix.d,
            x2: number = (this._canvas.width - matrix.e) / matrix.a,
            y2: number = (this._canvas.height - matrix.f) / matrix.d;
        return new Extent(Math.max(y1, y2), Math.min(y1, y2), Math.min(x1, x2), Math.max(x1, x2));
    }

    /**
     * 地图动态事件监听
     * @param event 
     * @param handler 
     */
    public on(event: string, handler: Function): void {
        this._events[event].push(handler);
    }

    /**
     * 动态更新 ViewCenter和 ViewExtent
     * @remarks
     * 常用于事件
     */
    private updataView(): void {
        this._layerExtent = this.getLayerExtent();
        this._viewExtent = this.getViewExtent();
        this._center = this.getCenter(this._viewExtent);
        this._events.extent.forEach((handler: () => any) => handler());
    }

    /**
     * 清除所有绘制的内容
     */
    public clear(): void {
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
    public redraw(): void {
        this._ctx.save();
        this.clear();
        this._ctx.restore();
        // 更新 视觉中心 和 可视区范围
        this.updataView();
        // 绘制所有图层
        this._layers.forEach(layer => {
            layer.draw(this._ctx, this._viewExtent, this._zoom);
        });
        this._layers.filter(
            layer => layer instanceof FeatureLayer && layer.labeled).forEach(
                (layer) => {
                    (layer as FeatureLayer).drawLabel(this._ctx, this.getViewExtent(), this._zoom);
                });
    }

    /**
     * 获取第K个图层
     * @param K 
     * @returns 
     * @remarks K从1开始
     */
    public getLayer(K: number): Layer {
        return this._layers[K - 1];
    }

    public getLayerByName(name: string): Layer {
        for (const layer of this._layers) {
            if (layer.name === name) {
                return layer;
            }
        }
        return null;
    }

    public removeLayerByName(name: string) {
        this.setView(this._zoom, this._layerExtent);
        this._layers = this._layers.filter(layer => layer.name !== name);
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        } else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
    }

    /**
     * 添加图层
     * @param layer 图层
     */
    public pushLayer(layer: Layer): void {
        this._layers.push(layer);
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        } else {
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
    public insertLayer(K: number, layer: Layer): void {
        this._layers.splice(K - 1, 0, layer);
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        } else {
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
    public removeKthLayer(K: number): Layer {
        const layer = this._layers.splice(K - 1, 1)[0];
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        } else {
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
    public removeLayer(layer: Layer): Layer {
        const index = this._layers.findIndex(item => item === layer);
        const delayer = this._layers.splice(index, 1)[0];
        this._layerExtent = this.getLayerExtent();
        // 根据图层中心点和图层Extent设置转移矩阵
        // 视觉中心点（Canvas中心）为图层中心点
        if (this._tile) {
            this.setView(this._zoom);
        } else {
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
    public upLayer(K: number): void {
        const layer = this._layers.splice(K - 1, 1)[0];
        this._layers.splice(0, 0, layer);
        this.redraw();
    }

    /**
     * 清空图层
     */
    public clearLayer(): void {
        this._layers = [];
        this.redraw();
    }

    public hiddenLayer(k: number) {
        this._layers[k - 1].visible = false;
        this.redraw();
    }

    public showLayer(k: number) {
        this._layers[k - 1].visible = true;
        this.redraw();
    }

    // -------------- 事件绑定 --------------- //

    /**
     * 鼠标事件的拖拽记录
     */
    private _drag: { flag: boolean, start: { x: number, y: number }, end: { x: number, y: number } } = {
        flag: false,
        start: {
            x: 0,
            y: 0
        },
        end: {
            x: 0,
            y: 0
        }
    }

    /**
     * 统一绑定事件
     */
    private _addEventListener(): void {
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
    private _onMouseDown(event: MouseEvent): void {
        this._drag.flag = true;
        this._drag.start.x = event.x;
        this._drag.start.y = event.y;
    }

    private _onDoubleClick(event: MouseEvent): void {
        // 阻止冒泡
        event.preventDefault();
        let zoom = this._zoom + 2 >= this._maxZoom ? this._maxZoom - this._zoom : 2;
        this._zoom += zoom;
        let scale = Math.pow(2, zoom);
        this._ctx = scaleGeometry(
            this._ctx,
            {
                x: event.offsetX,
                y: event.offsetY
            },
            scale
        );
        this.redraw();
    }

    /**
     * 鼠标移动时带动几何图形并重绘
     * @param event 鼠标事件
     */
    private _onMouseMove(event: MouseEvent): void {
        if (!this._drag.flag) return;
        // 鼠标下压的时候记录开始位置 移动的时候不断记录最终位置并转移
        this._drag.end.x = event.x;
        this._drag.end.y = event.y;
        const matrix = this._ctx.getTransform();
        this._ctx.translate(
            (this._drag.end.x - this._drag.start.x) / matrix.a,
            (this._drag.end.y - this._drag.start.y) / matrix.d
        );
        // 转移后该位置就是起始点
        this._drag.start.x = event.x;
        this._drag.start.y = event.y;
        this.redraw();
    }

    /**
     * 鼠标松开时不再记录
     * @param event 鼠标事件
     */
    private _onMouseUp(event: MouseEvent): void {
        this._drag.flag = false;
    }

    /**
     * 滚轮事件绑定放大缩小并重绘
     * @param event 滚轮事件
     */
    private _onWheel(event: WheelEvent): void {
        // 阻止冒泡
        event.preventDefault();
        // 获取放大缩小的指数
        let scale: number = 1;
        const sensitivity: number = 100;
        const delta: number = event.deltaY / sensitivity;
        // 获取放大缩小的倍数 放大2 缩小0.5
        delta < 0 ? scale *= delta * (-2) : scale /= delta * 2;

        let zoom = Math.round(Math.log(scale));

        if (zoom > 0) {
            // 放大
            zoom = this._zoom + zoom >= this._maxZoom ? this._maxZoom - this._zoom : zoom;
        } else if (zoom < 0) {
            // 缩小
            zoom = this._zoom + zoom <= this._minZoom ? this._minZoom - this._zoom : zoom;
        }

        if (zoom == 0) return;
        this._zoom += zoom;

        scale = Math.pow(2, zoom);
        // 通过变换矩阵进行变换
        this._ctx = scaleGeometry(
            this._ctx,
            {
                x: event.offsetX,
                y: event.offsetY
            },
            scale
        );

        this.redraw();
    }

    /**
     * 当浏览器大小变化的时候实时更新canvas大小
     */
    private _onResize(): void {
        this._canvas.width = this._container.clientWidth;
        this._canvas.height = this._container.clientHeight;
        if (this._tile) {
            this.setView(this._zoom);
        } else {
            this.setView(this._zoom, this._layerExtent);
        }
        this.redraw();
    }

}