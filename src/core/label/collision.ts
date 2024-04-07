import {Feature} from "../element/Feature";
import {SimpleTextSymbol} from "../render/symbol/PointSymbol";
import {Field} from "../render/Field";
import { Extent } from "../render/Extent";

/**
 * 冲突检测基类
 */
export class Collision {
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features: Feature[], field: Field, symbol: SimpleTextSymbol, ctx: CanvasRenderingContext2D): Feature[] { return []; }
}

/**
 * 无检测机制
 */
export class NullCollision {
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features: Feature[], field: Field, symbol: SimpleTextSymbol, ctx: CanvasRenderingContext2D): Feature[] {
        //没有任何检测逻辑，直接原样返回
        return features;
    }
}


/**
 * 简单碰撞冲突
 * @remarks
 * 类似聚合，距离判断，速度快
 */
export class SimpleCollision {
    /**
     * 检测距离
     * @remarks
     * 单位 pixel
     */
    public distance: number = 50;
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features: Feature[], field: Field, symbol: SimpleTextSymbol, ctx: CanvasRenderingContext2D): Feature[] {
        //根据距离聚合
        return features.reduce( (acc, cur) => {
            const item: any = acc.find((item: any) => {
                const distance = cur.geometry.distance(item.geometry, ctx);
                return distance <= this.distance;
            });
            if (!item) acc.push(cur);
            return acc;
        }, []); // [feature]
    }
}

/**
 * 叠盖碰撞冲突
 * @remarks
 * 试算标注宽高，并和已通过检测的标注，进行边界的交叉判断，速度慢
 */
export class CoverCollision {
    /**
     * 已通过检测的标注的边界集合
     */
    private _extents: Extent[] = [];
    /**
     * 判断边界碰撞时的buffer
     * @remarks
     * buffer越小，标注越密，单位：pixel
     */
    public buffer: number = 10;
    /**
     * 冲突检测
     * @param {Feature[]} features - 准备绘制标注的要素集合
     * @param {Field} field - 标注字段
     * @param {SimpleTextSymbol} symbol - 标注文本符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {Projection} projection - 坐标投影转换
     * @return {Feature[]} 返回可绘制标注的要素集合
     */
    test(features: Feature[], field: Field, symbol: SimpleTextSymbol, ctx: CanvasRenderingContext2D): Feature[] {
        if (!field || !symbol) return [];
        this._extents = [];
        const measure = (feature: Feature, symbol: SimpleTextSymbol) => {
            const extent = feature.geometry.measure((feature.properties as any)[field.name], ctx, symbol);
            extent.buffer(this.buffer);
            if (extent) {
                const item = this._extents.find( item => item.intersect(extent) );
                if (!item) {
                    return extent;
                }
            }
            return null;
        };
        const replace: any = (feature: Feature, symbol: SimpleTextSymbol, count: number) => {
            const symbol2 = new SimpleTextSymbol();
            symbol2.copy(symbol);
            symbol2.replacement();
            const bound = measure(feature, symbol2);
            if (bound) {
                return [bound, symbol2];
            } else {
                if (count == 0) {
                    return [null, null];
                } else {
                    count -= 1;
                    return replace(feature, symbol2, count);
                }
            }
        };
        //根据标注宽高的量算，得到标注的size，并和已通过检测的标注，进行边界的交叉判断，来决定是否可绘制该要素的标注
        return features.reduce( (acc, cur) => {
            cur.text = null;
            let bound = measure(cur, symbol);
            if (bound) {
                acc.push(cur);
                this._extents.push(bound);
            } else {
                if (symbol.auto) {
                    const [bound, symbol2] = replace(cur, symbol, 3);    //一共4个方向，再测试剩余3个方向
                    if (bound) {
                        cur.text = symbol2;
                        acc.push(cur);
                        this._extents.push(bound);
                    }
                }
            }
            return acc;
        }, []); // [feature]
    }
}