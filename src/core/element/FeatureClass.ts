import { GeometryType } from "../geometry/Geometry";
import { Field, FieldDataType } from "../render/Field";
import { Feature } from "./Feature";
import { Point } from "../geometry/Point";
import { Polyline } from "../geometry/Polyline";
import { Polygon } from "../geometry/Polygon";
import { MultiPoint } from "../geometry/MultiPoint";
import { MultiPolyline } from "../geometry/MultiPolyline";
import { MultiPolygon } from "../geometry/MultiPolygon";
import { Label } from "../label/Label";

/**
 * 要素集
 */
export class FeatureClass {
    public constructor(type: GeometryType, { features = [], fields = [], name = "", alias = "", description = "" }: any = {}) {
        this.name = name;
        this.alias = alias;
        this.description = description;
        this._features = features;
        this._featureLength = features.length;
        this._fields = fields;
        this._type = type;
    }

    /**
     * 要素集名称
     */
    public name: string;
    /**
     * 要素集别称
     */
    public alias: string;
    /**
     * 要素集描述
     */
    public description: string;
    /**
     * 要素集几何图形类型
     */
    private _type: GeometryType;
    /**
     * 要素集各个要素
     */
    private _features: Feature[];
    /**
     * 要素集要素个数
     */
    private _featureLength: number;
    /**
     * 要素集的各个字段
     */
    private _fields: Field[];

    /**
     * 要素集几何图形类型
     */
    public get type(): GeometryType { return this._type; }
    /**
     * 要素集各个要素
     */
    public get features(): Feature[] { return this._features; }
    /**
     * 要素集各个字段
     */
    public get fields(): Field[] { return this._fields; }
    /**
     * 要素集要素个数
     */
    public get length(): number { return this._featureLength; }

    /**
     * 添加 Feature
     * @param feature 
     */
    public addFeature(feature: Feature): void {
        this._features.push(feature);
        this._featureLength++;
    }

    /**
     * 删除指定 Feature
     * @param feature 
     * @returns 删去Feature所在的位置
     */
    public removeFeature(feature: Feature): number {
        const index: number = this._features.findIndex(item => item === feature);
        if (index !== -1) this._features.splice(index, 1);
        this._featureLength--;
        return index;
    }

    /**
     * 删除指定位置的 Feature
     * @param K 
     * @returns 该位置的 Feature
     */
    public removeKth(K: number): Feature {
        const feature: Feature[] = this._features.splice(K, 1);
        this._featureLength--;
        return feature[0];
    }

    /**
     * 清空 FeatureClass
     */
    public clearFeature(): void {
        this._features = [];
        this._featureLength = 0;
    }

    /**
     * 添加指定字段
     * @param field 字段
     */
    public addField(field: Field): void {
        this._fields.push(field);
    }

    /**
     * 删除指定字段
     * @param field 字段
     */
    public removeField(field: Field): void {
        const index = this._fields.findIndex(item => item === field);
        if (index !== -1) this._fields.splice(index, 1);
    }

    /**
     * 清空字段
     */
    public clearField(): void {
        this._fields = [];
    }

    /**
     * 解析 GeoJson
     * @param data geojson转后对象
     */
    public static fromGeoJson(opts: { type: GeometryType, data: any, name?: string, alias?: string, description?: string }): FeatureClass {
        const features: Feature[] = [];

        Array.isArray(opts.data.features) && opts.data.features.forEach((feature: any) => {
            switch (feature.geometry.type) {
                case "Point":
                    const point = new Point(feature.geometry.coordinates);
                    features.push(new Feature(point, feature.properties));
                    break;

                case "LineString":
                    const line = new Polyline(feature.geometry.coordinates);
                    features.push(new Feature(line, feature.properties));
                    break;

                case "Polygon":
                    const surface = new Polygon(feature.geometry.coordinates);
                    features.push(new Feature(surface, feature.properties));
                    break;

                case "MultiPoint":
                    const multiPoint = new MultiPoint(feature.geometry.coordinates);
                    features.push(new Feature(multiPoint, feature.properties));
                    break;

                case "MultiLineString":
                    const multiLineString = new MultiPolyline(feature.geometry.coordinates);
                    features.push(new Feature(multiLineString, feature.properties));
                    break;

                case "MultiPolygon":
                    const multiPolygon = new MultiPolygon(feature.geometry.coordinates);
                    features.push(new Feature(multiPolygon, feature.properties));
                    break;

                default:
                    break;
            }
        });

        // 统计字段
        const items: {name: string, type: string}[] = [];
        for (let feature of features) {
            feature.properties && Object.entries(feature.properties).forEach(p => {
                let flag = true;
                const item = {
                    name: p ? p[0] : "",
                    type: typeof(p[1])
                };
                for (let field of items) {
                    if (field.name == item.name)
                        flag = false;
                }
                if (flag)
                    items.push(item);
            })
        }
        const fields: Field[] = [];
        for (let item of items) {
            const type = item.type === "number" ? FieldDataType.Number : FieldDataType.Text;
            fields.push(new Field(item.name, type));
        }

        return new FeatureClass(opts.type, {
            features: features,
            name: opts.name ? opts.name : "",
            alias: opts.alias ? opts.alias : "",
            description: opts.description ? opts.description : "",
            fields: fields
        });
    }
}