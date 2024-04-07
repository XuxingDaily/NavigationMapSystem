import { Extent } from "../render/Extent";
import { PointSymbol } from "../render/symbol/PointSymbol";
import { Geometry, GeometryType } from "./Geometry";


export class MultiPoint extends Geometry {
    public constructor(coordinates: number[][]) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new PointSymbol();
        this._extent = this.getExtent();
        this._type = GeometryType.MultiPoint;
    }

    /**
     * 多点类型几何图形地理坐标
     * @remarks 格式：[[x1, y1], [x2, y2], ...]
     */
    private _geoCoordinates: number[][];
    /**
     * 多点类型几何图形屏幕坐标
     * @remarks 通过转移矩阵计算所得
     */
    private _screenCoordinates: number[][];
    /**
     * 多点类型几何图形符号
     */
    private _symbol: PointSymbol;

    public toGeoJson() {
        return {
            "type": "MultiPoint",
            "coordinates": this._geoCoordinates
        };
    }

    public async draw(ctx: CanvasRenderingContext2D, extent: Extent, symbol: PointSymbol = new PointSymbol): Promise<void> {
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
    }

    public getCenter(): number[] {
        return [];
    }

    public getExtent(): Extent {

        let arr: number[][] = this._geoCoordinates;
        
        let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = -Number.MAX_VALUE, ymax = -Number.MAX_VALUE;
        arr.forEach(point => {
            xmin = Math.min(xmin, point[0]);
            ymin = Math.min(ymin, point[1]);
            xmax = Math.max(xmax, point[0]);
            ymax = Math.max(ymax, point[1]);
        });

        return new Extent(ymax, ymin, xmin, xmax);
    }

    public contain(screenCoordinate: number[]): boolean {
        return false;
    }
}