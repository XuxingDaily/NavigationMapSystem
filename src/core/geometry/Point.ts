import { Geometry, GeometryType } from "./Geometry";
import { Extent } from "../render/Extent";
import { PointSymbol } from "../render/symbol/PointSymbol";

/**
 * 点类型几何图形
 */
export class Point extends Geometry {
    public constructor(coordinate: number[]) {
        super();
        this._geoCoordinates = coordinate;
        this._screenCoordinates = [];
        this._symbol = new PointSymbol();
        this._extent = this.getExtent();
        this._type = GeometryType.Point;
    }

    /**
     * 点类型几何图形地理坐标
     * @remarks 格式：[x, y]
     */
    private _geoCoordinates: number[];
    /**
     * 点类型几何图形屏幕坐标
     * @remarks 通过转移矩阵计算所得
     */
    private _screenCoordinates: number[];
    /**
     * 点类型几何图形符号
     */
    private _symbol: PointSymbol;

    /**
     * 点类型几何图形包络矩形
     */
    public get extent(): Extent { 
        return this._extent; 
    }

    public toGeoJson() {
        return {
            "type": "Point",
            "coordinates": [this._geoCoordinates[0], this._geoCoordinates[1]]
        }
    }

    /**
     * 绘制几何图像
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     * @param symbol 几何图像符号
     * @returns 
     */
    public async draw(ctx: CanvasRenderingContext2D, extent: Extent, symbol: PointSymbol): Promise<void> {
        // 渲染可视区范围内的部分
        if (!extent.intersect(this._extent)) return;
        // 获取屏幕坐标
        const matrix: DOMMatrix = ctx.getTransform();
        this._screenCoordinates[0] = (matrix.a * this._geoCoordinates[0] + matrix.e);
        this._screenCoordinates[1] = (matrix.d * this._geoCoordinates[1] + matrix.f);
        // 获取symbol
        if (symbol) this._symbol = symbol;
        else this._symbol = new PointSymbol();
        // 绘制
        this._symbol.draw(ctx, this._screenCoordinates);
    }

    /**
     * 获取几何图形中心点
     * @returns {number[]} 中心点数组 [x, y]
     */
    public getCenter(): number[] {
        if (this._geoCoordinates) 
            return [this._geoCoordinates[0], this._geoCoordinates[1]];
        else 
            return null;
    }

    /**
     * 获取点类型几何图形包络矩形
     * @returns {Extent} 几何图形包络矩形
     */
    public getExtent(): Extent {
        const xmax: number = this._geoCoordinates[0];
        const xmin: number = this._geoCoordinates[0];
        const ymax: number = this._geoCoordinates[1];
        const ymin: number = this._geoCoordinates[1];
        return new Extent(ymax, ymin, xmin, xmax);
    }

    /**
     * 判断鼠标点是否在点类型几何图形范围内
     * @param screenCoordinate 鼠标屏幕坐标
     * @returns {boolean} 
     */
    public contain(screenCoordinate: number[]): boolean {
        if (this._symbol) 
            return this._symbol.contain(screenCoordinate, this._screenCoordinates)
        else 
            return false;
    }
}