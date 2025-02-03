import { Pos2, Region } from "./common";

export type ColorData = {
    r: number;
    g: number;
    b: number;
    a: number;
}

export type PixelData = {
    id: number;
    data: Uint8ClampedArray;
    visible: boolean;
    readonly width: number;
    readonly height: number;
    tool: string
    setPixelAt(x: number, y: number, color: ColorData): void;
    drawOnCanvas(ctx: CanvasRenderingContext2D, pixelSize: number, region: Region | null): void;
    rgbaStrAt(x: number, y: number): string;
    copyFrom(other: PixelData): void;
    clear(): void;
    mergeWith(other: PixelData): void;
}

export function getGridPos(e: React.MouseEvent, id: string, pixelSize: number): Pos2 {
    const canvas = document.getElementById(id)! as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((e.clientX - rect.left) / pixelSize),
        y: Math.floor((e.clientY - rect.top) / pixelSize)
    };
}

export function initTransparentLayerData(data: Uint8ClampedArray, width: number) {
    let count = 0;
    let row = 0;
    for (let i = 0; i < data.length; i += 4) {
        count++;

        const white = count % 2 === (row % 2 ? 1 : 0);
        data[i] = white ? 200 : 120;
        data[i + 1] = white ? 200 : 120;
        data[i + 2] = white ? 200 : 120;
        data[i + 3] = 255;

        if (count === width) {
            count = 0;
            row++;
        }
    }
}

let pixelId = 1;
export function nextPixelId() {
    return pixelId++;
}

export function initPixelData(width: number, height: number, tool: string): PixelData {
    const data = new Uint8ClampedArray(width * height * 4);
    if (tool === 'transparent') {
        initTransparentLayerData(data, width);
    }
    return {
        id: nextPixelId(),
        data: data,
        width: width,
        height: height,
        visible: true,
        tool: tool,
        rgbaStrAt: function (x: number, y: number): string {
            const i = (y * this.width + x) * 4;
            return `rgba(${this.data[i]}, ${this.data[i + 1]}, ${this.data[i + 2]}, ${this.data[i + 3] / 255})`;
        },
        setPixelAt: function (x: number, y: number, color: ColorData) {
            const i = (y * this.width + x) * 4;
            this.data[i] = color.r;
            this.data[i + 1] = color.g;
            this.data[i + 2] = color.b;
            this.data[i + 3] = color.a;
        },
        drawOnCanvas: function (ctx: CanvasRenderingContext2D, pixelSize: number, region: Region | null) {
            if (!region) {
                let updates = 0;
                const imageData = ctx.createImageData(this.width, this.height);
                for (let i = 0; i < this.data.length; i++) {
                    imageData.data[i] = this.data[i];
                }
                ctx.putImageData(imageData, 0, 0);
                console.log('updates', updates);
            }
            else {
                let updates = 0;
                let cnv: HTMLCanvasElement = document.getElementById('canvas1')! as HTMLCanvasElement;
                for (let y = 0; y <= region.height; y++) {
                    for (let x = 0; x <= region.width; x++) {
                        updates++;
                        ctx.fillStyle = this.rgbaStrAt(region.x + x, region.y + y);
                        ctx.fillRect((region.x + x) * pixelSize, (region.y + y) * pixelSize, pixelSize, pixelSize);
                    }
                }
                console.log('updates', updates);
            }
        },
        copyFrom: function (other: PixelData) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const i = (y * this.width + x) * 4;
                    const otherI = i;
                    this.data[i] = other.data[otherI];
                    this.data[i + 1] = other.data[otherI + 1];
                    this.data[i + 2] = other.data[otherI + 2];
                    this.data[i + 3] = other.data[otherI + 3];
                }
            }
        },
        mergeWith: function (other: PixelData) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const i = (y * this.width + x) * 4;
                    const otherI = i;
                    if (other.data[otherI + 3] > 0) {
                        this.data[i] = other.data[otherI];
                        this.data[i + 1] = other.data[otherI + 1];
                        this.data[i + 2] = other.data[otherI + 2];
                        this.data[i + 3] = other.data[otherI + 3];
                    }
                }
            }
        },
        clear: function () {
            for (let i = 0; i < this.data.length; i++) {
                this.data[i] = 0;
            }
        }
    };
}




