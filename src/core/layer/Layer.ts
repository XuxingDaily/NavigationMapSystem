import { Extent } from "../render/Extent";

/**
 * 图层基类
 */
export class Layer {
    public constructor(name: string = "", des: string = "") {
        this.name = name;
        this.description = des;
        this.visible = true;
    }
    
    /**
     * 图层名称
     */
    public name: string;
    /**
     * 图层描述
     */
    public description: string;
    /**
     * 图层是否可见
     * @remarks 控制图层是否渲染
     */
    public visible: boolean;

    
    public minZoom: number = 0;
    public maxZoom: number = 10;

    /**
     * 对图层进行绘制
     * @param ctx Canvas画笔
     * @param extent 可视区范围
     */
    public draw(ctx: CanvasRenderingContext2D, extent: Extent, zoom: number): void {}
}