import { PixelPencilTool, Tool } from "./tool";

export type ColorData = {
    r: number;
    g: number;
    b: number;
    a: number;
}

export type CanvasModel = {
    readonly width: number;
    readonly height: number;
    readonly pixelSize: number;
    currentTool: Tool;
    getWidth(): number;
    readonly pixelData: PixelData;
    readonly pixelDataList: Array<PixelData>;
    clear(): void;
    drawOnCanvas(ctx: CanvasRenderingContext2D): void;
    getGridPos(e: React.MouseEvent): { x: number, y: number };
}

export type PixelData = {
    data: Uint8ClampedArray;
    readonly width: number;
    readonly height: number;
    setPixelAt(x: number, y: number, color: ColorData): void;
    drawOnCanvas(ctx: CanvasRenderingContext2D, pixelSize: number): void;
    rgbaStrAt(x: number, y: number): string;
    mergeWith(other: PixelData): void;
}

export function initPixelData(width: number, height: number): PixelData {
    const data = new Uint8ClampedArray(width * height * 4);
    return {
        data: data,
        width: width,
        height: height,
        rgbaStrAt: function(x: number, y: number): string {
            const i = (y * this.width + x) * 4;
            return `rgba(${this.data[i]}, ${this.data[i+1]}, ${this.data[i+2]}, ${this.data[i+3]/255})`;
        }, 
        setPixelAt: function(x: number, y: number, color: ColorData) {
            const i = (y * this.width + x) * 4;
            this.data[i] = color.r;
            this.data[i + 1] = color.g;
            this.data[i + 2] = color.b;
            this.data[i + 3] = color.a;
        },
        drawOnCanvas: function(ctx: CanvasRenderingContext2D, pixelSize: number) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    ctx.fillStyle = this.rgbaStrAt(x, y);
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        },
        mergeWith: function(other: PixelData) {
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
        }
    };
}

export function newCanvas(id: string, width: number, height: number, pixelSize: number): CanvasModel {
    const canvas: CanvasModel = {
        width: width,
        height: height,
        pixelSize: pixelSize,
        currentTool: PixelPencilTool,
        pixelData: initPixelData(width, height),
        pixelDataList: [],
        getWidth: function() {
            return this.width;
        },

        clear: function() {
        },

        drawOnCanvas: function(ctx: CanvasRenderingContext2D) {
            ctx.clearRect(0, 0, this.width * this.pixelSize, this.height * this.pixelSize);
            this.pixelData.drawOnCanvas(ctx, this.pixelSize);
            this.currentTool.draw(this, ctx);
        },

        getGridPos: function(e: React.MouseEvent): { x: number, y: number } {
            const canvas = document.getElementById(id)! as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();
            return {
                x: Math.floor((e.clientX - rect.left)/pixelSize),
                y: Math.floor((e.clientY - rect.top)/pixelSize)
            };
        }
    };

    return canvas;
}







