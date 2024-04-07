import { Renderer } from "./Renderer";
import { Symbol } from "../symbol/Symbol"
import { Field } from "../Field";
import { FeatureClass } from "../../element/FeatureClass";
import { Feature } from "../../element/Feature";

/**
 * 分级渲染依赖的级结构
 */
class ClassRendererItem {
    public constructor(low:number, hign: number, symbol: Symbol, label: string = (low + " - " + hign)) {
        this.hign = hign;
        this.low = low;
        this.label = label;
        this.symbol = symbol;
    }
    /**
     * 分级渲染该级下限
     */
    public low: number;
    /**
     * 分级渲染该级上限
     */
    public hign: number;
    /**
     * 分级渲染该级符号
     */
    public symbol: Symbol;
    /**
     * 分级渲染该级题目
     */
    public label: string;
}

/**
 * 分级渲染
 */
export class ClassRenderer extends Renderer {
    public constructor(field: Field, items: ClassRendererItem[]) {
        super();
        this._field = field;
        this._items = items;
    }
    /**
     * 分级渲染分级项集合
     */
    private _items: ClassRendererItem[];
    /**
     * 分级渲染的基础字段
     * @remarks
     * 要求：Number
     */
    private _field: Field;

    /**
     * 分级渲染分级项集合
     */
    public get item(): ClassRendererItem[] {
        return this._items; 
    }
    /**
     * 分级渲染的基础字段
     */
    public get field(): Field { 
        return this._field; 
    }

    /**
     * 等间距分级渲染
     * @param featureClass 要素集
     * @param field 分级字段
     * @param breaks 类别数
     */
    public static generate(featureClass: FeatureClass, field: Field, breaks: number): ClassRenderer {
        const items: ClassRendererItem[] = [];
        // 获取最大最小值
        const stat = featureClass.features.map(feature => (feature.properties as any)[field.name]).reduce((stat, cur) => {
            stat.max = Math.max(cur, stat.max);
            stat.min = Math.min(cur, stat.min);
        }, {min: Number.MIN_VALUE, max: Number.MAX_VALUE});
        // 间隔
        const interval = stat.max - stat.min;
        // 放入item
        for (let i = 0; i < breaks; ++i) {
            const symbol: Symbol = Renderer.getRandomSymbol(featureClass.type);
            const low: number = stat.min + i * interval / breaks;
            const hign: number = stat.min + (i + 1) * interval / breaks;
            const label: string = `${low} - ${hign}`;
            const item: ClassRendererItem = new ClassRendererItem(low, hign, symbol, label);
            items.push(item);
        }
        return new ClassRenderer(field, items);
    }

    /**
     * 获取分级渲染下对应属性值的Symbol
     * @param feature 要素
     */
    public getSymbol(feature: Feature): Symbol {
        const value: number = (feature.properties as any)[this.field.name];
        const item: ClassRendererItem = this._items.filter(item => {
            if (item.hign > value && item.low < value) return true;
            else return false;
        })[0];
        return item.symbol;
    }
    
}