import { Symbol } from "./Symbol";

/**
 * 填充符号
 */
export class FillSymbol extends Symbol {
    public constructor(lineWidth: number = 1, strokeStyle: string = "ff0000", fillStyle: string = "#ff000088") {
        super(lineWidth, strokeStyle, fillStyle);
    }

    /**
     * 通过Renderer调用Symbol去绘制面类型几何图像
     * @param ctx Canvas上下文
     * @param screenCoordinates 几何图形屏幕坐标
     */
    public draw(ctx: CanvasRenderingContext2D, screenCoordinates: number[][][]): void {
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.resetTransform();
        ctx.beginPath();
        screenCoordinates.forEach(ring => {
            ring.forEach((point, index) => {
                if (index === 0) ctx.moveTo(point[0], point[1]);
                else ctx.lineTo(point[0], point[1]);
            });
        });
        ctx.closePath();
        ctx.fill("evenodd");
        ctx.stroke();
        ctx.restore();
    }
}
