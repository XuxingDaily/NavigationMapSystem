import { FeatureLayer } from "../layer/FeatureLayer";
import { Extent } from "../render/Extent";

/**
 * 放大缩小几何图形
 * @param ctx Canvas上下文
 * @param target 聚焦点
 * @param scale 放大缩小倍数
 * @return {CanvasRenderingContext2D} Canvas上下文
 * @remarks 在ctx中存储的变换矩阵是重点
 */
export const scaleGeometry = (ctx: CanvasRenderingContext2D, target: {x: number, y: number}, scale: number): CanvasRenderingContext2D => {
    const matrix: DOMMatrix = ctx.getTransform();
    // 计算水平偏移量
    const
        a1 = matrix.a,
        e1 = matrix.e,
        x1 = target.x,
        x2 = x1;
    // 水平偏移量
    const e = (x2 - scale * (x1 - e1) - e1) / a1;
    // 计算垂直偏移量
    const
        d1 = matrix.d,
        f1 = matrix.f,
        y1 = target.y,
        y2 = y1;
    // 垂直偏移量
    const f = (y2 - scale * (y1 - f1) - f1) / d1;
    ctx.transform(scale, 0, 0, scale, e, f);
    return ctx;
}

/**
 * 屏幕坐标转地理坐标
 * @param ctx Canvas上下文
 * @param coordinate 屏幕点坐标
 * @returns 地理点坐标
 */
 export const screenToGeo = (ctx: CanvasRenderingContext2D, coordinate: number[]): number[] => {
    const matrix: DOMMatrix = ctx.getTransform();
    const 
        x_screen: number = coordinate[0], y_screen: number = coordinate[1];
    const
        x_geo: number = (x_screen - matrix.e) / matrix.a,
        y_geo: number = (y_screen  - matrix.f) / matrix.d;
    return [x_geo, y_geo];
}

/**
 * 点击要素高亮
 * @param screenCoordinat 屏幕点坐标
 * @param extent 可视区范围
 * @param featureLayer 图层
 * @remarks Map根据是否开启identify调用该方法
 */
export const ClickHighlighted = (screenCoordinat: number[], extent: Extent, featureLayer: FeatureLayer): void => {
    // 当identify开启，则可以使用该函数
    // 遍历可视区范围内的每一个要素的Geometry，利用contain函数判断是否点击到
    featureLayer.featureClass.features.forEach(feature => {
        // 如果不相交，则退出
        if (feature.geometry.intersect(extent)) return;
        if (feature.geometry.contain(screenCoordinat)) {
            // 如果点到了
            feature.isHeightLighted = true;
        } else {
            // 如果没点到
            feature.isHeightLighted = false;
        }
    });
    // 如果点击到，启动Feature的isHignLight属性，利用高亮的symbol
    // 点击其他区域，则取消这个高亮symbol，用原来的symbol重绘
}

/**
 * 清除高亮
 * @param featureLayer 图层
 */
export const ClearHighlighted = (featureLayer: FeatureLayer): void => {
    featureLayer.featureClass.features.forEach(feature => {
        feature.isHeightLighted = false;
    });
}
