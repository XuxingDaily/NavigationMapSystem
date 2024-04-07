import { Map } from "../Map";
import { Extent } from "../render/Extent";

export class Tiles {
    public constructor({ map, extent, url, resolution }: any) {
        this._map = map;
        this._url = url;
        this._extent = extent;
        this._resolution = resolution;

        //create div
        this._container = document.createElement("div");
        this._container.style.height = this._map.container.clientHeight + "px";
        this._container.style.width = this._map.container.clientWidth + "px";
        this._container.style.position = "absolute";
        this._container.style.top = this._map.container.style.top;
        this._container.style.zIndex = "-1";
        this._container.style.pointerEvents = "none";
        this._container.style.overflow = "hidden";
        this._container.style.userSelect = "none";

        this._map.container.appendChild(this._container);

        this._extentChange = this._extentChange.bind(this);
        // this._map.on("extent", this._extentChange);

        window.addEventListener("resize", this._onResize.bind(this));
        // this.draw();
    }

    private _container: HTMLDivElement;
    private _map: Map;
    protected _url: string;
    private _resolution: number[];
    private _extent: Extent;

    public get url(): string { return this._url; }
    public set url(value: string) { this._url = value; }
    public get extent() { return this._extent; }

    protected _extentChange(event: any) {
        this.draw();
    }

    public async draw(): Promise<void> {
        if (!this._url) return;

        this._container.innerHTML = "";

        const extent = this._map.getViewExtent();
        const zoom = this._map.zoom;

        const [tileMinX, tileMinY, tileMaxX, tileMaxY] = this._geoCoord2Tile(
            extent,
            zoom
        );
        const [pixelX, pixelY] = this._geoCoord2Pixel(extent, zoom);

        for (let x = tileMinX; x <= tileMaxX; x++) {
            for (let y = tileMinY; y <= tileMaxY; y++) {
                const url = this._getURL(this._url, y, x, zoom);
                let tile = new Image(256, 256);
                tile.onload = () => {
                    tile.style.position = "absolute";
                    tile.style.left = `${(x - tileMinX) * 256 + pixelX}px`;
                    tile.style.top = `${(y - tileMinY) * 256 + pixelY}px`;
                    this._container.appendChild(tile);
                };
                // tile.src = url;
            }
        }
    }

    private _geoCoord2Tile(extent: Extent, zoom: number) {
        const tileSize = 256;
        const resolution = this._resolution[zoom];

        const startX = Math.floor(
            (extent.xmin - this._extent.xmin) / (tileSize * resolution)
        );
        const startY = Math.floor(
            (this._extent.ymax - extent.ymax) / (tileSize * resolution)
        );
        const endX = Math.ceil(
            (extent.xmax - this._extent.xmin) / (tileSize * resolution)
        );
        const endY = Math.ceil(
            (this._extent.ymax - extent.ymin) / (tileSize * resolution)
        );

        return [startX, startY, endX, endY];
    }

    private _geoCoord2Pixel(extent: Extent, zoom: number) {
        const tileSize = 256;
        const tileResolution = this._resolution[zoom];

        const pixelX = Math.floor((extent.xmin / tileResolution) / tileSize);
        const pixelY = Math.floor((extent.ymax / tileResolution) / tileSize);

        return [pixelX, pixelY];
    }

    private _getURL(baseURL: string, X: number, Y: number, Z: number): string {
        return baseURL
            .replace("{x}", X.toString())
            .replace("{y}", Y.toString())
            .replace("{z}", Z.toString());
    }

    private _onResize() {
        this._container.style.width = this._map.container.clientWidth + "px";
        this._container.style.height = this._map.container.clientHeight + "px";
        this.draw();
    }
}