import { Field } from "../render/Field";
import { FillSymbol } from "../render/symbol/FillSymbol";
import { LineSymbol } from "../render/symbol/LineSymbol";
import { PointSymbol, SimpleTextSymbol } from "../render/symbol/PointSymbol";
import { Extent } from "../render/Extent";
import { Geometry, GeometryType } from "../geometry/Geometry";
import { Symbol } from "../render/symbol/Symbol";

/**
 * 要素
 */
export class Feature {
    public constructor(geometry: Geometry, properties: any) {
        // 放入geometry
        this._geometry = geometry;
        // 按顺序放入属性
        this._properties = properties;
        // 默认下可视
        this.visible = true;
        // 默认下不开启高亮
        this.isHeightLighted = false;
    }

    /**
     * 要素是否可视
     */
    public visible: boolean;
    /**
     * 要素几何图形
     */
    private _geometry: Geometry;
    /**
     * 要素属性
     */
    private _properties: any;
    /**
     * 是否高亮
     */
    public isHeightLighted: boolean;
    /**
     * 标注符号
     */
    protected _text: SimpleTextSymbol;

    public get text() {
        return this._text;
    }

    public set text(t: SimpleTextSymbol) {
        this._text = t;
    }

    /**
     * 要素几何图形
     */
    public get geometry(): Geometry {
        return this._geometry;
    }
    /**
     * 要素属性
     */
    public get properties(): Field[] {
        return this._properties;
    }
    /**
     * 要素几何图形包络矩形
     */
    public get extent(): Extent | null {
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
    label(field: Field, ctx: CanvasRenderingContext2D, symbol: SimpleTextSymbol = new SimpleTextSymbol()) {
        if (this.visible) 
            this._geometry.label(this._properties[field.name], ctx, this._text ? this._text : symbol);
    }

    /**
     * 绘制几何图形
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     * @param symbol 几何图形符号
     */
    public draw(ctx: CanvasRenderingContext2D, extent: Extent, symbol: Symbol): void {
        if (this.visible) {
            if (this.isHeightLighted) {
                let heightLightSymbol: Symbol = new Symbol(1, "#1286d3", "#88deff");
                switch (this._geometry.type) {
                    case GeometryType.Point || GeometryType.MultiPoint:
                        heightLightSymbol = new PointSymbol(1, "#1286d3", "#88deff");
                        break;

                    case GeometryType.Polyline || GeometryType.MultiPolyline:
                        heightLightSymbol = new LineSymbol(1, "#1286d3");
                        break;

                    case GeometryType.Polygon || GeometryType.MultiPolygon:
                        heightLightSymbol = new FillSymbol(1, "#1286d3", "#88deff");
                        break;

                    case GeometryType.MultiPoint:
                        heightLightSymbol = new PointSymbol(1, "#1286d3", "#88deff", (this._geometry as any)._symbol.radius);
                        break;

                    case GeometryType.MultiPolyline:
                        heightLightSymbol = new LineSymbol(1, "#1286d3");
                        break;

                    case GeometryType.MultiPolygon:
                        heightLightSymbol = new FillSymbol(1, "#1286d3", "#88deff");
                        break;

                    default:
                        break;
                }
                this._geometry.draw(ctx, extent, heightLightSymbol);
            } else {
                this._geometry.draw(ctx, extent, symbol);
            }
        }
    }

    /**
     * 判断要素与可视区范围是否交叉
     * @param extent 可视区范围
     * @returns 
     */
    public intersect(extent: Extent): boolean {
        if (this.visible) return this._geometry.getExtent().intersect(extent);
        else return false;
    }

}