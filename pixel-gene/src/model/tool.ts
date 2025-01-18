import { CanvasModel, initPixelData, PixelData } from "./canvasmodel";

export interface Tool {
    name: string;
    icon: string;
    currentPos: {x: number, y: number};
    start: (model: CanvasModel) => void;
    end: () => void;
    mouseDown: (e: React.MouseEvent, model: CanvasModel) => void;
    mouseMove: (e: React.MouseEvent, model: CanvasModel) => void;
    mouseUp: (e: React.MouseEvent, model: CanvasModel) => void;
    cancel: () => void;
    draw: (model: CanvasModel, ctx: CanvasRenderingContext2D) => void;
    commit: (mode: CanvasModel) => PixelData;
}

export interface PixelPencilTool extends Tool {
    reset: () => void;
    pixelData: PixelData | null;
    isMouseDown: boolean;
}

export const PixelPencilTool: PixelPencilTool = {
    name: "Pixel Pencil",
    icon: "",
    pixelData: null,
    isMouseDown: false,
    currentPos: {x: 0, y: 0},
    start: function(model: CanvasModel) {
        this.pixelData = initPixelData(model.width, model.height);
    },
    end: function() {
        this.reset();
    },
    cancel: function() {
        this.reset();
    },
    reset: function() {
        this.isMouseDown = false;
        this.pixelData = null;
    },
    mouseDown: function(e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = true;
        this.currentPos = model.getGridPos(e);
    },
    mouseMove: function(e: React.MouseEvent, model: CanvasModel) {
        this.currentPos = model.getGridPos(e);
        if (this.isMouseDown) {
            this.pixelData?.setPixelAt(this.currentPos.x, this.currentPos.y, {r: 0, g: 255, b: 0, a: 255});
        }
    },
    mouseUp: function(e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = false;
    },
    draw: function(model: CanvasModel, ctx: CanvasRenderingContext2D) {
        this.pixelData!.drawOnCanvas(ctx, model.pixelSize);

        ctx.fillStyle = "rgba(0, 255, 0, 1)";
        ctx.fillRect(this.currentPos.x * model.pixelSize, this.currentPos.y * model.pixelSize, model.pixelSize, model.pixelSize);
    },
    commit: function(model: CanvasModel)  {
        return this.pixelData as PixelData;
    }
}

export interface PixelRectTool extends Tool {
    reset: () => void;
    pixelData: PixelData | null;
    initPos: {x: number, y: number};
    isMouseDown: boolean;
}

export const RectTool: PixelRectTool = {
    name: "Rect Pencil",
    icon: "",
    pixelData: null,
    isMouseDown: false,
    initPos: {x: 0, y: 0},
    currentPos: {x: 0, y: 0},
    start: function(model: CanvasModel) {
        this.pixelData = initPixelData(model.width, model.height);
    },
    end: function() {
        this.reset();
    },
    cancel: function() {
        this.reset();
    },
    reset: function() {
        this.isMouseDown = false;
        this.pixelData = null;
        this.initPos = {x: 0, y: 0};
        this.currentPos = {x: 0, y: 0};
    },
    mouseDown: function(e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = true;
        this.initPos = model.getGridPos(e);
        this.currentPos = model.getGridPos(e);
    },
    mouseMove: function(e: React.MouseEvent, model: CanvasModel) {
        this.currentPos = model.getGridPos(e);
        if (this.isMouseDown) {
            for (let x = Math.min(this.initPos.x, this.currentPos.x); x <= Math.max(this.initPos.x, this.currentPos.x); x++) {
                for (let y = Math.min(this.initPos.y, this.currentPos.y); y <= Math.max(this.initPos.y, this.currentPos.y); y++) {
                    this.pixelData?.setPixelAt(x, y, {r: (x*10)%255, g: (y*10)%255, b: (x+y)*2%255, a: 255});
                }
            }
        }
    },
    mouseUp: function(e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = false;
    },
    draw: function(model: CanvasModel, ctx: CanvasRenderingContext2D) {
        this.pixelData!.drawOnCanvas(ctx, model.pixelSize);

        ctx.fillStyle = "rgba(0, 255, 0, 1)";
        ctx.fillRect(this.currentPos.x * model.pixelSize, this.currentPos.y * model.pixelSize, model.pixelSize, model.pixelSize);
    },
    commit: function(model: CanvasModel)  {
        return this.pixelData as PixelData;
    }
}