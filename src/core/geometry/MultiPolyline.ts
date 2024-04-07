import { Extent } from "../render/Extent";
import { LineSymbol } from "../render/symbol/LineSymbol";
import { Geometry, GeometryType } from "./Geometry";

export class MultiPolyline extends Geometry {
    public constructor(coordinates: number[][][]) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new LineSymbol();
        this._extent = this.getExtent();
        this._type = GeometryType.MultiPolyline;
    }

    protected static TOLERANCE: number = 4;
    protected _tolerance: number = 4;

    /**
     * 多线类型几何图形地理坐标
     * @remarks 格式： [[[x1, y1], [x2, y2], ...], [[x1, y1], [x2, y2], ...]]
     */
    private _geoCoordinates: number[][][];
    /**
     * 线类型几何图形屏幕坐标
     * @remarks 通过转移矩阵计算所得
     */
    private _screenCoordinates: number[][][];
    /**
     * 线类型几何图形符号
     */
    private _symbol: LineSymbol;

    public toGeoJson() {
        return {
            "type": "MultiLineString",
            "coordinates": this._geoCoordinates
        };
    }

    public async draw(ctx: CanvasRenderingContext2D, extent: Extent , symbol: LineSymbol = new LineSymbol()): Promise<void> {
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
    }

    public getCenter(): number[] {
        let i, halfDist, segDist, dist, p1, p2, ratio,
            points = this._geoCoordinates[0],
            len = points.length;

        if (!len) { return null; }

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

    public getExtent(): Extent {
        let arr: number[][][] = this._geoCoordinates;

        let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = -Number.MAX_VALUE, ymax = -Number.MAX_VALUE;
        arr.forEach(ring => {
            ring.forEach(point => {
                xmin = Math.min(xmin, point[0]);
                ymin = Math.min(ymin, point[1]);
                xmax = Math.max(xmax, point[0]);
                ymax = Math.max(ymax, point[1]);
            })
        });

        return new Extent(ymax, ymin, xmin, xmax);
    }

    public contain(screenCoordinate: number[]): boolean {
        let p2: number[];
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
        };
        return this._screenCoordinates.some(polyline => {
            const distance = polyline.reduce((acc, cur) => {
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
        });
    }

    /**
     * 获取线类型几何图形的长度
     * from Leaflet
     * @returns {number} 线总长度
     */
    public getLength(): number {

        let sum = 0;
        this._geoCoordinates.forEach((line, i) => {
            line.forEach((point, j) => {
                if (j > 0) {
                    sum += Math.sqrt(Math.pow(point[0] - this._geoCoordinates[i][j - 1][0], 2) + Math.pow(point[1] - this._geoCoordinates[i][j - 1][0], 2));
                }
            })
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
        return Math.sqrt(Math.pow((point2[0] - point1[0]), 2) + Math.pow((point2[1] - point1[1]), 2));
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