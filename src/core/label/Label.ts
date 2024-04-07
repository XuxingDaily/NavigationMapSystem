import { Field } from "../render/Field";
import { SimpleTextSymbol } from "../render/symbol/PointSymbol";
import { Collision, SimpleCollision } from "./collision";
import { Feature } from "../element/Feature";

/**
 * 图层标注设置
 */
export class Label {

    public constructor({field, symbol, collision}: any) {
        this.field = field;
        this.symbol = symbol ? symbol : new SimpleTextSymbol();
        this.collision = collision ? collision : new SimpleCollision();
    }
    /**
     * 标注字段
     */
    field: Field;
    /**
     * 标注符号
     */
    symbol: SimpleTextSymbol;
    /**
     * 标注冲突解决方式
     */
    collision: Collision;

    /**
     * 绘制图层标注
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     */
    public draw(features: Feature[], ctx: CanvasRenderingContext2D) {
        //通过冲突检测，得到要绘制的要素集合
        const remain: Feature[] = this.collision.test(features, this.field, this.symbol, ctx);
        //遍历绘制要素标注
        remain.forEach((feature: Feature) => {
            feature.label(this.field, ctx, this.symbol);
        });
    }
}