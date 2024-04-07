import { Layer } from "./Layer";
import { Extent } from "../render/Extent";
import { FeatureClass } from "../element/FeatureClass";
import { Renderer } from "../render/renderer/Renderer";
import { SimpleRenderer } from "../render/renderer/SimpleRenderer";
import { Feature } from "../element/Feature";
import { Label } from "../label/Label";

/**
 * 要素图层
 */
export class FeatureLayer extends Layer {
    public constructor(featureClass: FeatureClass, renderer: Renderer = new SimpleRenderer(featureClass.type)) {
        super();
        this._featureClass = featureClass;
        this._renderer = renderer;
        this._extent = this.getExtentFromFeature();
    }

    /**
     * 要素集
     */
    private _featureClass: FeatureClass;
    /**
     * 图层渲染方式
     */
    private _renderer: Renderer;
    /**
     * 图层包络矩形
     */
    private _extent: Extent;
    /**
     * 图层标注设置
     */
    private _label: Label;
    /**
     * 是否显示标注
     */
    public labeled: boolean = false;

    /**
     * 图层标注设置
     */
    get label(): Label {
        return this._label;
    }
    set label(value: Label) {
        this._label = value;
    }
    /**
     * 图层要素集
     */
    public get featureClass(): FeatureClass {
        return this._featureClass;
    }
    public set featureClass(featureClass: FeatureClass) {
        this._featureClass = featureClass;
    }
    /**
     * 图层渲染方式
     */
    public get renderer(): Renderer {
        return this._renderer;
    }
    public set renderer(renderer: Renderer) {
        this._renderer = renderer;
    }
    /**
     * 图层包络矩形
     */
    public get extent(): Extent {
        return this._extent;
    }

    /**
     * 通过FeatureLayer绘制
     * @param ctx 
     * @param extent 
     * @returns 
     */
    public draw(ctx: CanvasRenderingContext2D, extent: Extent, zoom: number): void {
        if (!this.visible || zoom < this.minZoom || zoom > this.maxZoom) {
            return;
        }

        // 筛选出与可视区相交的feature
        const features: Feature[] = this._featureClass.features.filter(feature => feature.intersect(extent));
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
    public drawLabel(ctx: CanvasRenderingContext2D, extent: Extent, zoom: number) {
        if (this.visible && this.minZoom <= zoom && this.maxZoom >= zoom) {
            const features = this._featureClass.features.filter((feature: Feature) => feature.intersect(extent));
            this._label.draw(features, ctx);
        }
    }

    /**
     * 动态获取FeatureLayer中的最大Extent
     * @returns {Extent} 图层Extent
     */
    public getExtentFromFeature(): Extent {
        const xMaxArr: number[] = [];
        const xMinArr: number[] = [];
        const yMaxArr: number[] = [];
        const yMinArr: number[] = [];
        this._featureClass.features.forEach(feature => {
            xMaxArr.push(feature.geometry.getExtent().xmax);
            xMinArr.push(feature.geometry.getExtent().xmin);
            yMaxArr.push(feature.geometry.getExtent().ymax);
            yMinArr.push(feature.geometry.getExtent().ymin);
        });
        return new Extent(Math.max(...yMaxArr), Math.min(...yMinArr), Math.min(...xMinArr), Math.max(...xMaxArr));
    }
}