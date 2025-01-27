import { getGridPos } from "./canvasmodel";
import { getRegion, Pos2, Region } from "./common";
import { EditorState } from "./useEditorState";

export interface Tool {
    name: string;
    icon: string;
    currentPos: Pos2;
    lastPos: Pos2;
    start: (state: EditorState) => void;
    end: () => void;
    reset: () => void;
    mouseDown: (e: React.MouseEvent, state: EditorState) => void;
    mouseMove: (e: React.MouseEvent, state: EditorState) => void;
    mouseUp: (e: React.MouseEvent, state: EditorState) => void;
    dirtyRegion: Region | null;
}

export interface PixelPencilTool extends Tool {
    reset: () => void;
    isMouseDown: boolean;
}

export const PixelPencilTool: PixelPencilTool = {
    name: "Pixel Pencil",
    icon: "",
    isMouseDown: false,
    currentPos: { x: 0, y: 0 },
    lastPos: { x: 0, y: 0 },
    dirtyRegion: null,
    start: function (model: EditorState) {
    },
    end: function () {
        this.reset();
    },
    reset: function () {
        this.isMouseDown = false;
    },
    mouseDown: function (e: React.MouseEvent, state: EditorState) {
        this.isMouseDown = true;
        this.currentPos = getGridPos(e, "canvas1", state.pixelSize);
    },
    mouseMove: function (e: React.MouseEvent, state: EditorState) {
        this.currentPos = getGridPos(e, "canvas1", state.pixelSize);
        this.dirtyRegion = getRegion(this.lastPos, this.currentPos);
        if (this.isMouseDown) {
            state.currentBuffer?.setPixelAt(this.currentPos.x, this.currentPos.y, { r: 0, g: 255, b: 0, a: 255 });
        }
        else {
            state.pointerBuffer?.setPixelAt(this.lastPos.x, this.lastPos.y, { r: 0, g: 0, b: 0, a: 0 });
            state.pointerBuffer?.setPixelAt(this.currentPos.x, this.currentPos.y, { r: 0, g: 255, b: 0, a: 255 });
        }
        this.lastPos = this.currentPos;
    },
    mouseUp: function () {
        this.isMouseDown = false;
    },
}

export interface MouseTool extends Tool {
    initPos: { x: number, y: number };
    isMouseDown: boolean;
}

export interface CanvasBackedTool extends MouseTool {
    canvasElement: HTMLCanvasElement | null;
}

interface LineTool extends CanvasBackedTool {
    lastPos: { x: number, y: number };
}

export const LineTool: LineTool = {
    name: "Line Pencil",
    icon: "",
    isMouseDown: false,
    initPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    canvasElement: null,
    lastPos: { x: 0, y: 0 },
    dirtyRegion: null,
    start: function (state: EditorState) {
        this.canvasElement = document.getElementById("canvas3") as HTMLCanvasElement;
    },
    end: function () {
        this.canvasElement = null;
        this.isMouseDown = false;
        this.initPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
    },
    reset: function () {
        this.isMouseDown = false;
        this.initPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
    },
    mouseDown: function (e: React.MouseEvent, state: EditorState) {
        this.isMouseDown = true;
        this.initPos = getGridPos(e, 'canvas1', state.pixelSize);
        this.currentPos = getGridPos(e, 'canvas1', state.pixelSize);
    },
    mouseMove: function (e: React.MouseEvent, state: EditorState) {
        this.currentPos = getGridPos(e, 'canvas1', state.pixelSize);
        this.dirtyRegion = getRegion(this.initPos, this.lastPos);
        if (!this.canvasElement) return;

        if (this.isMouseDown) {
            const ctx = this.canvasElement.getContext('2d');
            if (ctx) {
                // Clear the canvas¥
                ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

                // Draw the line
                ctx.beginPath();
                ctx.lineWidth = 1;
                const offset = ctx.lineWidth % 2 === 0 ? 0 : 0.5;
                ctx.strokeStyle = "black";
                ctx.moveTo(this.initPos.x + offset, this.initPos.y + offset);
                ctx.lineTo(this.currentPos.x + offset, this.currentPos.y + offset);
                ctx.stroke();
                let imageData = ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
                state.currentBuffer!.clear();
                for (let i = 0; i < imageData.data.length; i++) {
                    state.currentBuffer!.data[i] = imageData.data[i];
                }
                console.log('copy');
            }
        }
        else {
            state.pointerBuffer?.setPixelAt(this.lastPos.x, this.lastPos.y, { r: 0, g: 0, b: 0, a: 0 });
            state.pointerBuffer?.setPixelAt(this.currentPos.x, this.currentPos.y, { r: 0, g: 255, b: 0, a: 255 });
            this.dirtyRegion = getRegion(this.lastPos, this.currentPos);
        }
        this.lastPos = this.currentPos;
    },
    mouseUp: function (e: React.MouseEvent, state: EditorState) {
        this.isMouseDown = false;
    }
}
/*
export const RectTool: MouseTool = {
    name: "Rect Pencil",
    icon: "",
    isMouseDown: false,
    initPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    start: function (model: CanvasModel) {
    },
    end: function () {
        this.reset();
    },
    reset: function () {
        this.isMouseDown = false;
        this.initPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
    },
    mouseDown: function (e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = true;
        this.initPos = model.getGridPos(e);
        this.currentPos = model.getGridPos(e);
    },
    mouseMove: function (e: React.MouseEvent, model: CanvasModel) {
        this.currentPos = model.getGridPos(e);
        if (this.isMouseDown) {
            for (let x = Math.min(this.initPos.x, this.currentPos.x); x <= Math.max(this.initPos.x, this.currentPos.x); x++) {
                for (let y = Math.min(this.initPos.y, this.currentPos.y); y <= Math.max(this.initPos.y, this.currentPos.y); y++) {
                    model.currentBuffer?.setPixelAt(x, y, { r: (x * 10) % 255, g: (y * 10) % 255, b: (x + y) * 2 % 255, a: 255 });
                }
            }
        }
    },
    mouseUp: function (e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = false;
    }
}



type CircleTool = LineTool;

export const CircleTool: CircleTool = {
    name: "Line Pencil",
    icon: "",
    isMouseDown: false,
    initPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    canvasElement: null,
    lastPos: { x: 0, y: 0 },
    start: function (model: CanvasModel) {
        this.canvasElement = document.getElementById("canvas3") as HTMLCanvasElement;
    },
    end: function () {
        this.canvasElement = null;
        this.isMouseDown = false;
        this.initPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
    },
    reset: function () {
        this.isMouseDown = false;
        this.initPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
    },
    mouseDown: function (e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = true;
        this.initPos = model.getGridPos(e);
        this.currentPos = model.getGridPos(e);
    },
    mouseMove: function (e: React.MouseEvent, model: CanvasModel) {
        this.currentPos = model.getGridPos(e);
        if (!this.canvasElement) return;

        if (this.isMouseDown) {
            const ctx = this.canvasElement.getContext('2d');
            if (ctx) {
                // Clear the canvas¥
                ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
                // Calculate center and radius
                const centerX = (this.initPos.x + this.currentPos.x) / 2;
                const centerY = (this.initPos.y + this.currentPos.y) / 2;
                const radiusX = Math.abs(this.currentPos.x - this.initPos.x) / 2;
                const radiusY = Math.abs(this.currentPos.y - this.initPos.y) / 2;

                // Draw ellipse
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.stroke();
                let imageData = ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
                for (let i = 0; i < imageData.data.length; i++) {
                    model.currentBuffer!.data[i] = imageData.data[i];
                }
                console.log('copy');
            }
        }
        else {
            model.currentBuffer?.setPixelAt(this.lastPos.x, this.lastPos.y, { r: 0, g: 0, b: 0, a: 0 });
            model.currentBuffer?.setPixelAt(this.currentPos.x, this.currentPos.y, { r: 0, g: 255, b: 0, a: 255 });
        }
        this.lastPos = this.currentPos;
    },
    mouseUp: function (e: React.MouseEvent, model: CanvasModel) {
        this.isMouseDown = false;
    }
}*/