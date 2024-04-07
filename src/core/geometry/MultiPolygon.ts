import { Extent } from "../render/Extent";
import { FillSymbol } from "../render/symbol/FillSymbol";
import { Geometry, GeometryType } from "./Geometry";

export class MultiPolygon extends Geometry {
    public constructor(coordinates: number[][][][]) {
        super();
        this._geoCoordinates = coordinates;
        this._screenCoordinates = [];
        this._symbol = new FillSymbol();
        this._extent = this.getExtent();
        this._type = GeometryType.Polygon;
    }

    private _geoCoordinates: number[][][][];
    private _screenCoordinates: number[][][][];

    private _symbol: FillSymbol;

    public toGeoJson() {
        return {
            "type": "MultiPolygon",
            "coordinates": this._geoCoordinates
        };
    }

    public async draw(ctx: CanvasRenderingContext2D, extent: Extent, symbol: FillSymbol = new FillSymbol()): Promise<void> {
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
        })
    }

    public getCenter(): number[] {
        let i, j, p1, p2, f, area, x, y, center;
        // get more points polygon
        const counts: any = this._geoCoordinates.map( polygon => {
            let count = 0;
            polygon.forEach( ring => {
                count = count + ring.length;
            })
            return count;
        });
        let index = counts.indexOf(Math.max(...counts));
        let points = this._geoCoordinates[index][0],
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

    public getExtent(): Extent {
        let arr: number[][][][] = this._geoCoordinates;

        let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = -Number.MAX_VALUE, ymax = -Number.MAX_VALUE;
        arr.forEach(polygon => {
            polygon.forEach(ring => {
                ring.forEach(point => {
                    xmin = Math.min(xmin, point[0]);
                    ymin = Math.min(ymin, point[1]);
                    xmax = Math.max(xmax, point[0]);
                    ymax = Math.max(ymax, point[1]);
                })
            })
        });
        return new Extent(ymax, ymin, xmin, xmax);
    }

    public contain(screenCoordinate: number[]): boolean {
        //first ring contained && others no contained
        const _pointInPolygon = (point: number[], vs: number[][]) => {
            let x = point[0], y = point[1];

            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                let xi = vs[i][0], yi = vs[i][1];
                let xj = vs[j][0], yj = vs[j][1];

                let intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }

            return inside;
        };
        //TODO: only test first polygon, ring is not supported
        return this._screenCoordinates.some(polygon => _pointInPolygon(screenCoordinate, polygon[0]));
    }

    public getArea(): number {
        let sum = 0;
        this._geoCoordinates.forEach(polygon => {
            polygon.forEach((ring, index) => {
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
        this._geoCoordinates.forEach(polygon => {
            polygon.forEach(ring => {
                ring.reduce((pre, cur) => {
                    primeter += this.calculationDistance(pre, cur);
                    return cur;
                });
            })
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