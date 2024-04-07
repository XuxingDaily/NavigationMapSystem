export enum FieldDataType { Text, Number }

/**
 * 字段
 */
export class Field {
    public constructor(name: string, type: FieldDataType = FieldDataType.Text, alias: string = "") {
        this.name = name;
        this.alias = alias;
        this.type = type;
    }

    /**
     * 字段名
     * @remarks 用于从Feature中找到对应的属性
     */
    public name: string;
    /**
     * 字段别称
     */
    public alias: string;
    /**
     * 字段类型
     * @remarks 1. Text; 2. Number
     */
    public type: FieldDataType;
}