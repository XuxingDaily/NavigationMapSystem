import { Renderer } from "./Renderer";
import { Symbol } from "../symbol/Symbol";
import { Field } from "../Field";
import { FeatureClass } from "../../element/FeatureClass";
import { Feature } from "../../element/Feature";

export class CategoryRendererItem {
    public constructor(value: any, symbol: Symbol, count: number = 1, label: string = value.toString()) {
        this.value = value;
        this.symbol = symbol;
        this.count = count;
        this.label = label;
    }

    /**
     * 分类渲染该类的值
     */
    public value: any;
    /**
     * 分类渲染该类的符号
     */
    public symbol: Symbol;
    /**
     * 分类渲染该类的注记
     */
    public label: string;
    /**
     * 分类渲染该类的数量
     */
    public count: number;
}

/**
 * 分类渲染
 */
export class CategoryRenderer extends Renderer {
    public constructor(field: Field, items: CategoryRendererItem[]) {
        super();
        this._field = field;
        this._items = items;
    }

    /**
     * 分类渲染所用字段
     */
    private _field: Field;
    /**
     * 分类渲染项
     */
    private _items: CategoryRendererItem[];

    /**
     * 分类渲染所用字段
     */
    public get field(): Field { 
        return this._field; 
    }
    /**
     * 分类渲染项
     */
    public get items(): CategoryRendererItem[] {
        return this._items; 
    }

    /**
     * 按照指定字段在指定要素集中分类渲染
     * @param featureClass 要素集
     * @param field 分类字段
     * @returns 
     */
    public static generate(featureClass: FeatureClass, field: Field): CategoryRenderer {
        let items: CategoryRendererItem[] = [];
        let symbol: Symbol;
        // 分类统计 获取items
        featureClass.features.map(feature => (feature.properties as any)[field.name]).forEach(value => {
            // 此处的value为properties中与field相同name的object
            // 循环中遇到相同的value则count++
            let item: CategoryRendererItem | undefined = items.find(item => item.value === value);
            if (item) {
                item.count++;
            } else {
                symbol = Renderer.getRandomSymbol(featureClass.type);
                const item: CategoryRendererItem = new CategoryRendererItem(value, symbol);
                items.push(item);
            }
        });
        return new CategoryRenderer(field, items);
    }

    /**
     * 分级渲染下特点属性值对应的Symbol
     * @param feature 要素
     */
    public getSymbol(feature: Feature): Symbol {
        const value: number | string = (feature.properties as any)[this._field.name];
        const item: CategoryRendererItem = this._items.filter(item => {
            return item.value === value
        })[0];
        return item.symbol;
    }
}