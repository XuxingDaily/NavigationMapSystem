/**
 * 十进制颜色
 */
export class Color {
    public constructor(r: number, g: number, b: number, a: number = 1) {
        this.a = a;
        this.b = b;
        this.g = g;
        this.r = r;
    }

    /**
     * Red
     */
    public r: number;
    /**
     * Green
     */
    public g: number;
    /**
     * Blue
     */
    public b: number;
    /**
     * Alpha
     */
    public a: number;

    /**
     * 输出rgba值
     * @returns {string} rgba
     */
    public toString(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    /**
     * 十六进制表示法转十进制表示法 RGB
     * @param {string} hex 十六进制 
     * @returns 十进制颜色
     */
    public static hexToRgb(hex: string): Color {
        let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6}|[0-9a-fA-f]{8})$/;
        hex = hex.toLowerCase();
        if (hex && reg.test(hex)) {
            //处理三位的颜色值
            if (hex.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += hex.slice(i, i + 1).concat(hex.slice(i, i + 1));
                }
                hex = sColorNew;
            }
            //处理六位的颜色值
            if (hex.length === 7) {
                hex += "ff";
            }
            let sColorChange = [];
            for (let i = 1; i < 9; i += 2) {
                sColorChange.push(parseInt("0x" + hex.slice(i, i + 2)));
            }
            return new Color(sColorChange[0], sColorChange[1], sColorChange[2], sColorChange[3]/255);
        }
        console.log("error Hex!");
        return new Color(0, 0, 0, 0);
    }

    /**
     * 十进制表示法 RGB 转十六进制表示法
     * @param color RGB颜色
     * @returns 十六进制颜色
     */
    public static rgbToHex(color: Color): string {
        return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }

    /**
     * 生成随机颜色
     * @returns {Color} 随机颜色
     */
    public static random(): Color {
        return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    }

    /**
     * 获取线性色带
     * @param start 起始颜色
     * @param end 终止颜色
     * @param count 间断数
     */
    public static ramp(start: Color, end: Color, count: number = 10): Color[] {
        const colors: Color[] = [];
        for (let i = 0; i < count; ++i) {
            colors.push(new Color((end.r - start.r) * i / count + start.r, (end.g - start.g) * i / count + start.g, (end.b - start.b) * i / count + start.b, (end.a - start.a) * i / count + start.a ));
        }
        return colors;
    }

}