import { SimpleTextSymbol } from "../../index";
import { Extent } from "../render/Extent";
import { Symbol } from "../render/symbol/Symbol";

/**
 * 几何图形类型
 */
export enum GeometryType {
    Point, Polyline, Polygon, MultiPoint, MultiPolyline, MultiPolygon
}

/**
 * 几何图形基类
 */
export abstract class Geometry {
    public constructor() {
        this._extent = new Extent(0, 0, 0, 0);
        this._type = GeometryType.Point;
    }

    /**
     * 几何图形类型
     */
    protected _type: GeometryType;
    /**
     * 几何图形包络矩形
     */
    protected _extent: Extent;

    /**
     * 几何图形类型
     */
    public get type(): GeometryType {
        return this._type;
    }

    /**
     * 包络矩形
     */
    public get extent(): Extent {
        return this._extent;
    }

    /**
     * 判断两个几何图像是否相交
     * @param {Extent} extent 
     * @returns {boolean} 是否相交
     */
    public intersect(extent: Extent): boolean {
        return extent.intersect(this._extent);
    }

    /**
     * 绘出几何图像（虚函数）
     * @param ctx Canvas画笔
     * @param extent 可视区四至
     * @param symbol 要素样式
     */
    public async draw(ctx: CanvasRenderingContext2D, extent: Extent, symbol: Symbol): Promise<void> { }

    /**
     * 转为geojson
     */
    public abstract toGeoJson(): any;

    /**
  * 标注绘制
  * @remarks
  * 标注文本支持多行，/r/n换行
  * @param {string} text - 标注文本
  * @param {CanvasRenderingContext2D} ctx - 绘图上下文
  * @param {SimpleTextSymbol} symbol - 标注符号
  */
    label(text: string, ctx: CanvasRenderingContext2D, symbol: SimpleTextSymbol = new SimpleTextSymbol()) {
        if (!text) 
            return;
        
        ctx.save();
        ctx.strokeStyle = symbol.strokeStyle;
        ctx.fillStyle = symbol.fillStyle;
        ctx.lineWidth = symbol.lineWidth;
        ctx.lineJoin = "round";
        ctx.font = symbol.fontSize + "px/1 " + symbol.fontFamily + " " + symbol.fontWeight;
        const center = this.getCenter();
        const matrix = (ctx as any).getTransform();
        
        //keep pixel
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const array = text.toString().split("/r/n");
        let widths = array.map(str => ctx.measureText(str).width + symbol.padding * 2);
        let width = Math.max(...widths);
        let height = symbol.fontSize * array.length + symbol.padding * 2 + symbol.padding * (array.length - 1);

        const screenX = (matrix.a * center[0] + matrix.e);
        const screenY = (matrix.d * center[1] + matrix.f);
        
        let totalX: number, totalY: number;
        switch (symbol.placement) {
            case "TOP":
                totalX = - width / 2;
                totalY = - symbol.pointSymbolHeight / 2 - height;
                break;
            case "BOTTOM":
                totalX = - width / 2;
                totalY = symbol.pointSymbolHeight / 2;
                break;
            case "RIGHT":
                totalX = symbol.pointSymbolWidth / 2;
                totalY = - height / 2;
                break;
            case "LEFT":
                totalX = - symbol.pointSymbolWidth / 2 - width;
                totalY = - height / 2;
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
    };

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
    measure(text: string, ctx: CanvasRenderingContext2D, symbol: SimpleTextSymbol = new SimpleTextSymbol()) {
        if (!text) return;
        ctx.save();
        ctx.font = symbol.fontSize + "px/1 " + symbol.fontFamily + " " + symbol.fontWeight;
        const center = this.getCenter();
        const matrix = (ctx as any).getTransform();
        //keep pixel
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const array = text.toString().split("/r/n");
        let widths = array.map(str => ctx.measureText(str).width + symbol.padding * 2);
        let width = Math.max(...widths);
        let height = symbol.fontSize * array.length + symbol.padding * 2 + symbol.padding * (array.length - 1);
        const screenX = (matrix.a * center[0] + matrix.e);
        const screenY = (matrix.d * center[1] + matrix.f);
        ctx.restore();
        let totalX: number, totalY: number;
        switch (symbol.placement) {
            case "TOP":
                totalX = - width / 2;
                totalY = - symbol.pointSymbolHeight / 2 - height;
                break;
            case "BOTTOM":
                totalX = - width / 2;
                totalY = symbol.pointSymbolHeight / 2;
                break;
            case "RIGHT":
                totalX = symbol.pointSymbolWidth / 2;
                totalY = - height / 2;
                break;
            case "LEFT":
                totalX = - symbol.pointSymbolWidth / 2 - width;
                totalY = - height / 2;
                break;
        }
        
        return new Extent(screenY + totalY + height,  screenY + totalY, screenX + totalX,screenX + totalX + width);
    };

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
    public distance(geometry: Geometry, ctx: CanvasRenderingContext2D) {
        const center = this.getCenter();
        const point = geometry.getCenter();
        const matrix = (ctx as any).getTransform();
        const screenX1 = (matrix.a * center[0] + matrix.e), screenY1 = (matrix.d * center[1] + matrix.f);
        const screenX2 = (matrix.a * point[0] + matrix.e), screenY2 = (matrix.d * point[1] + matrix.f);
        return Math.sqrt((screenX2-screenX1) * (screenX2-screenX1) + (screenY2-screenY1) * (screenY2-screenY1));
    }

    /**
     * 判断鼠标点是否在几何图形范围内
     * @param screenCoordinate 鼠标屏幕坐标
     * @returns {boolean}
     */
    public abstract contain(screenCoordinate: number[]): boolean;

    /**
     * 获取几何图像中心点坐标（虚函数）
     * @returns {number[]} 几何图形中心点坐标
     */
    public abstract getCenter(): number[];

    /**
     * 获取几何图形包络矩形
     * @remarks 主要用于图像刚刚建立的时候
     * @returns {Extent} 几何图形包络矩形
     */
    public abstract getExtent(): Extent;

}
