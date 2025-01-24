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
    currentBuffer: PixelData | null; // current temp uncommitted buffer
    committedBuffers: Array<PixelData>; // layers of buffer committed
    mergedCommittedBuffer: PixelData; // merged committed buffer

    drawOnCanvas(ctx: CanvasRenderingContext2D): void;
    getGridPos(e: React.MouseEvent): { x: number, y: number };
    startBuffer(): void;
    commitBuffer(): void;
    resetBuffer(): void;
}

export type PixelData = {
    data: Uint8ClampedArray;
    readonly width: number;
    readonly height: number;
    setPixelAt(x: number, y: number, color: ColorData): void;
    drawOnCanvas(ctx: CanvasRenderingContext2D, pixelSize: number): void;
    rgbaStrAt(x: number, y: number): string;
    copyFrom(other: PixelData): void;
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
        copyFrom: function(other: PixelData) {
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
        currentBuffer: initPixelData(width, height),
        committedBuffers: [],
        mergedCommittedBuffer: initPixelData(width, height),
        getWidth: function() {
            return this.width;
        },

        drawOnCanvas: function(ctx: CanvasRenderingContext2D) {
            ctx.clearRect(0, 0, this.width * this.pixelSize, this.height * this.pixelSize);
            this.mergedCommittedBuffer.drawOnCanvas(ctx, this.pixelSize);
            if (this.currentBuffer) {
                this.currentBuffer.drawOnCanvas(ctx, this.pixelSize);
            }
        },
        startBuffer: function() {
            this.currentBuffer = initPixelData(this.width, this.height);
        }, 
        commitBuffer: function() {
            if (this.currentBuffer) {
                this.committedBuffers.push(this.currentBuffer);
                this.mergedCommittedBuffer.mergeWith(this.currentBuffer);
                this.currentBuffer = null;
            }
        },
        resetBuffer: function() {
            this.currentBuffer = initPixelData(this.width, this.height);
        },
        getGridPos: function(e: React.MouseEvent): { x: number, y: number } {
            const canvas = document.getElementById(id)! as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();
            return {
                x: Math.floor((e.clientX - rect.left)/pixelSize),
                y: Math.floor((e.clientY - rect.top)/pixelSize)
            };
        },


    };

    return canvas;
}







