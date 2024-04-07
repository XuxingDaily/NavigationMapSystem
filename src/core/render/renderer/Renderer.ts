import { GeometryType } from "../../geometry/Geometry";
import { Color } from "../Color";
import { PointSymbol } from "../symbol/PointSymbol";
import { LineSymbol } from "../symbol/LineSymbol";
import { FillSymbol } from "../symbol/FillSymbol";
import { Symbol } from "../symbol/Symbol";
import { Feature } from "../../element/Feature";

/**
 * 渲染方式基类
 */
export class Renderer {

    public symbol: Symbol;
    /**
     * 获取随机颜色符号
     * @param type 几何图形类型
     * @return {Symbol} 随机颜色符号
     */
    public static getRandomSymbol(type: GeometryType): Symbol {
        switch (type) {
            case GeometryType.Point:
                const symbolPoint: PointSymbol = new PointSymbol();
                symbolPoint.fillStyle = Color.random().toString();
                symbolPoint.strokeStyle = Color.random().toString();
                return symbolPoint;
            case GeometryType.MultiPoint:
                const symbolMultiPoint: PointSymbol = new PointSymbol();
                symbolMultiPoint.fillStyle = Color.random().toString();
                symbolMultiPoint.strokeStyle = Color.random().toString();
                return symbolMultiPoint;
            case GeometryType.Polyline:
                const symbolLine: LineSymbol = new LineSymbol();
                symbolLine.strokeStyle = Color.random().toString();
                return symbolLine;
            case GeometryType.MultiPolyline:
                const symbolMultiLine: LineSymbol = new LineSymbol();
                symbolMultiLine.strokeStyle = Color.random().toString();
                return symbolMultiLine;
            case GeometryType.Polygon:
                const symbolFill: FillSymbol = new FillSymbol();
                symbolFill.fillStyle = Color.random().toString();
                symbolFill.strokeStyle = Color.random().toString();
                return symbolFill;
            case GeometryType.MultiPolygon:
                const symbolMultiFill: FillSymbol = new FillSymbol();
                symbolMultiFill.fillStyle = Color.random().toString();
                symbolMultiFill.strokeStyle = Color.random().toString();
                return symbolMultiFill; 
        }
    }

    /**
     * 获取该渲染下的Symbol（虚函数）
     * @returns {Symbol} 几何图形符号
     */
    public getSymbol(feature: Feature): Symbol {
        return new Symbol();
    }
}