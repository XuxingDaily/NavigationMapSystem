import { Renderer } from "./Renderer";
import { Symbol } from "../symbol/Symbol";
import { GeometryType } from "../../geometry/Geometry";
import { Feature } from "../../element/Feature";

/**
 * 单一渲染
 */
export class SimpleRenderer extends Renderer {
    public constructor(type: GeometryType, symbol?: Symbol) {
        super();
        this.symbol = Renderer.getRandomSymbol(type);
        this.symbol = symbol;
    }

    /**
     * 单一渲染对应符号
     */
    public symbol: Symbol;

    /**
     * 获取单一渲染下的Symbol
     * @returns 
     */
    public getSymbol(feature: Feature): Symbol {
        return this.symbol;
    }
}