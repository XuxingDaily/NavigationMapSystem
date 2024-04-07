import { Extent } from "../render/Extent";
import { Geometry, GeometryType } from "./Geometry";
import { LineSymbol } from "../render/symbol/LineSymbol";

/**
 * 线类型几何图形
 */
export class Polyline extends Geometry {
    public constructor(coordinates: number[][]) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new LineSymbol();
        this._extent = this.getExtent();
        this._type = GeometryType.Polyline;
    }

    /**
     * 容差
     * 用于鼠标交互
     * 单位：pixel
     */
    protected static TOLERANCE: number = 4;
    private _tolerance: number = 4;

    /**
     * 线类型几何图形地理坐标
     * @remarks 格式： [[x1, y1], [x2, y2], ...]
     */
    private _geoCoordinates: number[][];
    /**
     * 线类型几何图形屏幕坐标
     * @remarks 通过转移矩阵计算所得
     */
    private _screenCoordinates: number[][];
    /**
     * 线类型几何图形符号
     */
    private _symbol: LineSymbol;

    /**
     * 线类型几何图形包络矩形
     */
    public get extent(): Extent { 
        return this._extent; 
    }

    public toGeoJson(): any {
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
    public async draw(ctx: CanvasRenderingContext2D, extent: Extent, symbol: LineSymbol): Promise<void> {
        // 渲染可视区范围内的几何图像
        if (!extent.intersect(this._extent)) return;
        // 获得屏幕坐标
        const matrix = ctx.getTransform();
        this._screenCoordinates = this._geoCoordinates.map(point => {
            return [(matrix.a * point[0] + matrix.e), (matrix.d * point[1] + matrix.f)];
        });
        // 获取Symbol
        if (symbol) this._symbol = symbol;
        else this._symbol = new LineSymbol();
        // 绘制线类型几何图像
        this._symbol.draw(ctx, this._screenCoordinates);
    }

    /**
     * 获取线类型几何图形中心点
     * @returns {number[] | null} 几何图形中心点
     */
    public getCenter(): number[] | null {
        let i: number,
            halfDist: number, 
            segDist: number, 
            dist: number, 
            p1: number[], 
            p2: number[], 
            ratio: number,
            points = this._geoCoordinates,
            len = points.length;

        if (!len) { return null; }

        // polyline centroid algorithm; only uses the first ring if there are multiple

        for (i = 0, halfDist = 0; i < len - 1; i++) {
            halfDist += Math.sqrt((points[i + 1][0] - points[i][0]) * (points[i + 1][0] - points[i][0]) + (points[i + 1][1] - points[i][1]) * (points[i + 1][1] - points[i][1])) / 2;
        }

        let center: number[] = [];
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
    public getExtent(): Extent {
        let x_arr: number[] = [], y_arr: number[] = [];
        this._geoCoordinates.forEach(point => {
            x_arr.push(point[0]);
            y_arr.push(point[1]);
        });
        const xmax: number = Math.max(...x_arr);
        const xmin: number = Math.min(...x_arr);
        const ymax: number = Math.max(...y_arr);
        const ymin: number = Math.min(...y_arr);
        return new Extent(ymax, ymin, xmin, xmax);
    }

    /**
     * 判断鼠标点是否在线类型几何图形符号范围之内
     * @param screenCoordinate 鼠标屏幕坐标
     * @returns {boolean} 
     */
    public contain(screenCoordinate: number[]): boolean {
        let p2: number[];
        //from Leaflet
        //点到线段的距离，垂直距离
        const _distanceToSegment = (p: number[], p1: number[], p2: number[]) => {
            let x = p1[0],
                y = p1[1],
                dx = p2[0] - x,
                dy = p2[1] - y,
                dot = dx * dx + dy * dy,
                t;

            if (dot > 0) {
                t = ((p[0] - x) * dx + (p[1] - y) * dy) / dot;

                if (t > 1) {
                    x = p2[0];
                    y = p2[1];
                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }

            dx = p[0] - x;
            dy = p[1] - y;

            return Math.sqrt(dx * dx + dy * dy);
        }
        const distance = this._screenCoordinates.reduce((acc, cur) => {
            if (p2) {
                const p1 = p2;
                p2 = cur;
                return Math.min(acc, _distanceToSegment(screenCoordinate, p1, p2));
            } else {
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
    public getLength(): number {
        let sum = 0;
        this._geoCoordinates.forEach( (point, index) => {
            if (index > 0) {
                sum += Math.sqrt( Math.pow(point[0] - this._geoCoordinates[index - 1][0], 2) + Math.pow(point[1] - this._geoCoordinates[index - 1][1], 2) );
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
    private calculationDistance(point1: number[], point2: number[]): number {
        return Math.pow((point2[0] - point1[0]), 2) + Math.pow((point2[1] - point1[1]), 2);
    }

    /**
     * 求A点到BC边的距离
     * @param targetPoint A
     * @param startPoint B
     * @param endPoint C
     * @returns {number} A点到BC边的距离
     */
    private calPointToLine(targetPoint: number[], startPoint: number[], endPoint: number[]): number {
        //下面用海伦公式计算面积
        let a = Math.abs(this.calculationDistance(targetPoint, startPoint));
        let b = Math.abs(this.calculationDistance(targetPoint, endPoint));
        let c = Math.abs(this.calculationDistance(startPoint, endPoint));
        let p = (a + b + c) / 2.0;
        let s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
        return s * 2.0 / a;
    }
}