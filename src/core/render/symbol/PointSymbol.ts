import { Symbol } from "./Symbol";

/**
 * 点状符号
 */
export class PointSymbol extends Symbol {
    public constructor(lineWidth: number = 1, strokeStyle: string = "ff0000", fillStyle: string = "#ff000088", radius: number = 10) {
        super(lineWidth, strokeStyle, fillStyle);
        this.radius = radius;
    }

    /**
     * 点半径
     */
    public radius: number;

    /**
     * 通过Renderer调用Symbol去绘制点类型几何图像
     * @param ctx Canvas画笔
     * @param coordinate 屏幕坐标
     */
    public draw(ctx: CanvasRenderingContext2D, coordinate: number[]): void {
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.beginPath();
        // keep circle size
        const matrix: DOMMatrix = ctx.getTransform();
        ctx.resetTransform();
        ctx.arc(coordinate[0], coordinate[1], this.radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 判断点是否在符号范围内
     * @param anchorCoordinate 目标点
     * @param screenCoordinate 符号坐标
     * @returns {boolean} 是否在范围内
     */
    public contain(anchorCoordinate: number[], screenCoordinate: number[]): boolean {
        if (
            Math.sqrt(
                (anchorCoordinate[0] - screenCoordinate[0]) * (anchorCoordinate[0] - screenCoordinate[0]) + (anchorCoordinate[1] - screenCoordinate[1]) * (anchorCoordinate[1] - screenCoordinate[1])
            ) <= this.radius
        ) return true;
        else return false;
    }

}

/**
 * 图标符号
 * @remarks
 * 常用于POI兴趣点的渲染
 */
export class SimpleMarkerSymbol extends PointSymbol {
    public constructor(url: URL, width?: number, height?: number) {
        super();
        this.url = url.href;
        this.width = width ? width : 16;
        this.height = height ? height : 16;
        this.offsetX = width / -2;
        this.offsetY = height / -2;
    }
    /**
     * 宽
     */
    public width: number = 16;
    /**
     * 高
     */
    public height: number = 16;
    /**
     * offset，坐标点对应图标的位置
     * 例如，宽16px，高16px，offsetX为-8，offsetY为-8，意味着：
     * 该图标的中心点对应渲染点的坐标。
     */
    public offsetX: number = -8;
    /**
     * offset，坐标点对应图标的位置
     * 例如，宽16px，高16px，offsetX为-8，offsetY为-8，意味着：
     * 该图标的中心点对应渲染点的坐标。
     */
    public offsetY: number = -8;
    /**
     * 图标位图
     */
    public icon: ImageBitmap;
    public image: any;
    /**
     * 图标url
     */
    public url: string;

    private _loaded: boolean;
    /**
     * 记录是否已完成异步图标加载
     */
    public get loaded(): boolean {
        return this._loaded;
    }
    /**
     * 异步加载图标
     * @return {Color} 生成随机色带
     */
    public load(): Promise<any> {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                createImageBitmap(img).then(icon => {
                    this.icon = icon;
                    this._loaded = true;
                    resolve(icon);
                }, err => reject(err));
            };
            img.onerror = reject;
            img.src = this.url;
        })
    }

    /**
     * 绘制图标
     * @remarks 注意异步加载
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     * @param {number} screenCoordinate - 屏幕坐标
     */
    public draw(ctx: CanvasRenderingContext2D, screenCoordinate: number[]) {
        const [screenX, screenY] = screenCoordinate;
        if (!this._loaded) {
            this.image = new Image();
            this.image.src = this.url;
            this._loaded = true;
        };

        ctx.save();
        //const matrix = (ctx as any).getTransform();
        //keep size
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        //请对应参考offset属性的描述内容
        ctx.drawImage(this.icon || this.image, screenX + this.offsetX, screenY + this.offsetY, this.width, this.height);
        ctx.restore();
    }
    /**
     * 判断鼠标交互位置是否在符号范围内
     **/
    public contain(anchorCoordinate: number[], screenCoordinate: number[]) {
        const [anchorX, anchorY] = anchorCoordinate;
        const [screenX, screenY] = screenCoordinate;
        return screenX >= (anchorX + this.offsetX) && screenX <= (anchorX + this.offsetX + this.width) && screenY >= (anchorY + this.offsetY) && screenY <= (anchorY + this.offsetY + this.height);
    }

    public static async create(url: URL, width?: number, height?: number) {
        const marker = new SimpleMarkerSymbol(url, width, height);
        await marker.load();
        return marker;
    }


}

/**
 * 字符符号
 * @remarks
 * 中英文皆可，注意控制长度，推荐单个字符
 */
export class LetterSymbol extends PointSymbol {
    public constructor({ lineWidth, strokeStyle, fillStyle, letter, radius, fontColor, fontFamily, fontSize, fontWeight }: any) {
        super(lineWidth, strokeStyle, fillStyle);
        this.letter = letter ? letter : "";
        this.radius = radius ? radius : 10;
        this.fontColor = fontColor ? fontColor : "#ff0000";
        this.fontFamily = fontFamily ? fontFamily : "YaHei";
        this.fontSize = fontSize ? fontSize : 12;
        this.fontWeight = fontWeight ? fontWeight : "Bold";
    }
    /**
     * 外圈半径
     */
    public radius: number = 10;
    /**
     * 字符，中英文皆可，推荐单个字符
     */
    public letter: string = "";
    /**
     * 字体颜色
     */
    public fontColor: string = "#ff0000";
    /**
     * 字体大小
     */
    public fontSize: number = 12;
    /**
     * 字体
     */
    public fontFamily: string = "YaHei";
    /**
     * 字体粗细
     */
    public fontWeight: string = "Bold";

    /**
     * 绘制字符符号
     * @param {CanvasRenderingContext2D} ctx - 绘图上下文
     */
    public draw(ctx: CanvasRenderingContext2D, screenCoordinate: number[]) {
        const [screenX, screenY] = screenCoordinate;
        ctx.save();
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath(); //Start path
        //keep size
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        //绘制外圈
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = this.fontColor;
        ctx.font = this.fontSize + "px/1 " + this.fontFamily + " " + this.fontWeight;
        //绘制字符
        ctx.fillText(this.letter, screenX, screenY);
        ctx.restore();
    }
    /**
     * 判断鼠标交互位置是否在符号范围内 
     **/
    public contain(anchorCoordinate: number[], screenCoordinate: number[]) {
        const [anchorX, anchorY] = anchorCoordinate;
        const [screenX, screenY] = screenCoordinate;
        return Math.sqrt((anchorX - screenX) * (anchorX - screenX) + (anchorY - screenY) * (anchorY - screenY)) <= this.radius;
    }
}

/**
 * 文本符号
 * @remarks
 * 常用于文本标注
 */
export class SimpleTextSymbol extends Symbol {
    /**
     * 边框宽
     */
    public lineWidth: number = 3;
    /**
     * 边框色
     */
    public strokeStyle: string = "#ff0000"; //#ffffff
    /**
     * 填充色
     */
    public fillStyle: string = "#ffffff";    //#ffffff
    /**
     * X偏移
     */
    public offsetX: number = 0;
    /**
     * Y偏移
     */
    public offsetY: number = 1;
    /**
     * 周边留白
     */
    public padding: number = 5;
    /**
     * 字体颜色
     */
    public fontColor: string = "#ff0000";
    /**
     * 字体大小
     */
    public fontSize: number = 12;
    /**
     * 字体
     */
    public fontFamily: string = "YaHei";
    /**
     * 字体粗细
     */
    public fontWeight: string = "Bold";
    /**
     * 放置位置
     */
    public placement: string = "BOTTOM";   //BOTTOM TOP LEFT RIGHT
    /**
     * 自动调整位置
     */
    public auto: boolean = false;
    /**
     * 标注点符号的宽度
     */
    public pointSymbolWidth: number = 0;
    /**
     * 标注点符号的高度
     */
    public pointSymbolHeight: number = 0;

    /**
     * 自动调整位置
     * @remarks 按逆时针方向寻找合适位置
     */
    replacement() {
        if (this.auto) {
            switch (this.placement) {
                case "BOTTOM":
                    this.placement = "RIGHT";
                    break;
                case "RIGHT":
                    this.placement = "TOP";
                    break;
                case "TOP":
                    this.placement = "LEFT";
                    break;
                case "LEFT":
                    this.placement = "BOTTOM";
                    break;
            }
        }
    }

    /**
     * 复制符号
     */
    public copy(symbol: SimpleTextSymbol) {
        const copiedSymbol = this.deepCopy(symbol) as SimpleTextSymbol;
        Object.assign(this, copiedSymbol);
    }

    private deepCopy<T>(obj: T): T {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        const copy: any = Array.isArray(obj) ? [] : {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = this.deepCopy(obj[key]);
            }
        }

        return copy;
    }

}