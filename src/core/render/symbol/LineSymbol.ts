import { Symbol } from "./Symbol";

/**
 * 线状符号
 */
export class LineSymbol extends Symbol {
    public constructor(lineWidth: number = 1, strokeStyle: string = "ff0000") {
        super(lineWidth, strokeStyle);
    }

    /**
     * 通过Renderer调用Symbol去绘制线类型几何图像
     * @param ctx Canvas画笔
     * @param screenCoordinates 屏幕坐标
     */
    public draw(ctx: CanvasRenderingContext2D, screenCoordinates: number[][]): void {
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.resetTransform();
        ctx.beginPath();
        screenCoordinates.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point[0], point[1]);
            else ctx.lineTo(point[0], point[1]);
        });
        ctx.stroke();
        ctx.restore();
    }
}

export class LineDashSymbol extends LineSymbol {
    public constructor(lineWidth: number = 1, strokeStyle: string = "ff0000") {
        super(lineWidth, strokeStyle);
    }

    public draw(ctx: CanvasRenderingContext2D, screenCoordinates: number[][]): void {
        ctx.save();
  
        // 绘制绿色的实线
        ctx.strokeStyle = this.strokeStyle; // 设置绿色
        ctx.lineWidth = this.lineWidth;
        ctx.resetTransform();
        ctx.beginPath();
        screenCoordinates.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point[0], point[1]);
          else ctx.lineTo(point[0], point[1]);
        });
        ctx.stroke();
        
        // 绘制白色的虚线
        ctx.setLineDash([5, 20]); // 设置虚线样式
        ctx.strokeStyle = "#FFFFFF"; // 设置白色
        ctx.beginPath();
        screenCoordinates.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point[0], point[1]);
          else ctx.lineTo(point[0], point[1]);
        });
        ctx.stroke();
        
        ctx.restore();
    }

}