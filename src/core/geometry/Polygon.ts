import { Geometry, GeometryType } from "./Geometry";
import { Extent } from "../render/Extent";
import { FillSymbol } from "../render/symbol/FillSymbol"

/**
 * 面类型几何图形
 */
export class Polygon extends Geometry {
    public constructor(coordinates: number[][][]) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new FillSymbol();
        this._extent = this.getExtent();
        this._type = GeometryType.Polygon;
    }

    /**
     * 面类型几何图形地理坐标
     * @remarks
     * 格式： [[[x11, y11], [x12, y12], ...], [[x21, y21], [x22, y22], ...], ...]
     */
    private _geoCoordinates: number[][][];
    /**
     * 面类型几何图形屏幕坐标
     * @remarks 通过转移矩阵计算所得
     */
    private _screenCoordinates: number[][][];
    /**
     * 面类型几何图形符号
     */
    private _symbol: FillSymbol;

    /**
     * 面类型几何图形包络矩形
     */
    public get extent(): Extent {
        return this._extent;
    }

    public toGeoJson(): any {
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
    public async draw(ctx: CanvasRenderingContext2D, extent: Extent, symbol: FillSymbol): Promise<void> {
        // 只渲染可视区范围内元素
        if (!extent.intersect(this._extent)) return;
        const matrix: DOMMatrix = ctx.getTransform();
        // 获取屏幕坐标
        this._screenCoordinates = this._geoCoordinates.map(ring => {
            return ring.map(point => {
                return [(matrix.a * point[0] + matrix.e), (matrix.d * point[1] + matrix.f)];
            });
        });
        // 获取Symbol
        if (symbol) this._symbol = symbol;
        else this._symbol = new FillSymbol();
        // 绘制
        this._symbol.draw(ctx, this._screenCoordinates);
    }

    /**
     * 获取面类型几何图形中心点坐标
     * @returns 中心点坐标
     */
    public getCenter(): number[] | null {
        let i: number, j: number, p1: number[], p2: number[], f: number, area: number, x: number, y: number, center: number[],
            points = this._geoCoordinates[0],
            len = points.length;
        if (!len) { return null; }
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
        } else {
            center = [x / area, y / area];
        }
        return center;
    }

    /**
     * 获取面类型几何图形的包络矩形
     * @returns 几何图形包络矩形
     */
    public getExtent(): Extent {
        let x_arr: number[] = [], y_arr: number[] = [];
        this._geoCoordinates.forEach(ring => {
            ring.forEach(point => {
                x_arr.push(point[0]);
                y_arr.push(point[1]);
            });
        });
        const xmax: number = Math.max(...x_arr);
        const xmin: number = Math.min(...x_arr);
        const ymax: number = Math.max(...y_arr);
        const ymin: number = Math.min(...y_arr);
        return new Extent(ymax, ymin, xmin, xmax);
    }

    /**
     * 判断鼠标点是否在面类型几何图形范围内
     * @param screenCoordinate 鼠标屏幕坐标
     * @returns 
     */
    public contain(screenCoordinate: number[]): boolean {
        const first = this._screenCoordinates[0];
        const others = this._screenCoordinates.slice(1);

        //first ring contained && others no contained
        const _pointInPolygon = (point: number[], vs: number[][]) => {
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
    public getArea(): number {
        let sum = 0;
        this._geoCoordinates.forEach((ring, index) => {
            if (index == 0) {
                ring.forEach((point, index) => {
                    if (index > 0) {
                        //梯形面积
                        sum += 1 / 2 * (point[0] - ring[index - 1][0]) * (point[1] + ring[index - 1][1]);
                    }
                })
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
    public getPerimeter(): number {
        let primeter: number = 0;
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
    private calculationDistance(point1: number[], point2: number[]): number {
        return Math.pow((point2[0] - point1[0]), 2) + Math.pow((point2[1] - point1[1]), 2);
    }
}