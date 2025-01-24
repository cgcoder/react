import React from "react";
import { initPixelData, newCanvas, PixelData } from "../model/canvasmodel";
import { Button } from "@mantine/core";
import { PixelPencilTool, RectTool } from "../model/tool";

const pixelSize = 15;
let gridValues = new Array<Array<number>>();
let imageWidth = 100;
let imageHeight = 50;
let previewBuffer: PixelData = initPixelData(imageWidth, imageHeight);

function initGridValues(rows: number, cols: number) {
    gridValues = new Array<Array<number>>(rows);
    for (let i = 0; i < rows; i++) {
        gridValues[i] = new Array<number>(cols);
        for (let j = 0; j < cols; j++) {
            gridValues[i][j] = 0xFFFFFFFF;
        }
    }
}

initGridValues(imageHeight, imageWidth);

function copyImage() {
    const ctx = (document.getElementById("canvas2") as HTMLCanvasElement)?.getContext("2d");
    const imageData = ctx!.createImageData(imageWidth, imageHeight);
    previewBuffer.copyFrom(canvasModel.mergedCommittedBuffer);
    if (canvasModel.currentBuffer)
        previewBuffer.mergeWith(canvasModel.currentBuffer!);
    imageData.data.set(previewBuffer.data);
    ctx?.putImageData(imageData, 0, 0);
}
const canvasModel = newCanvas("canvas1", imageWidth, imageHeight, pixelSize);

export const EditorCanvas = () => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [idx, setIdx] = React.useState(0);

    const mouseMove = (e: React.MouseEvent, forceDown?: boolean) => {
        canvasModel.currentTool.mouseMove(e, canvasModel);
        canvasModel.drawOnCanvas(canvasRef.current?.getContext("2d")!);
        copyImage();
        e.preventDefault();
        e.stopPropagation();
        setIdx(idx + 1);
    };

    const mouseDown = (e: React.MouseEvent) => {
        canvasModel.currentTool.mouseDown(e, canvasModel);
        canvasModel.drawOnCanvas(canvasRef.current?.getContext("2d")!);
        e.preventDefault();
        e.stopPropagation();
        setIdx(idx + 1);
    };

    const mouseUp = (e: React.MouseEvent) => {
        canvasModel.currentTool.mouseUp(e, canvasModel);
        canvasModel.commitBuffer();
        canvasModel.drawOnCanvas(canvasRef.current?.getContext("2d")!);

        e.preventDefault();
        e.stopPropagation();
        setIdx(idx + 1);
        copyImage();
    };
    const select = () => {
        canvasModel.currentTool = PixelPencilTool;
        canvasModel.startBuffer();
        canvasModel.currentTool.start(canvasModel);

    }
    const rect = () => {
        canvasModel.currentTool = RectTool;
        canvasModel.startBuffer();
        canvasModel.currentTool.start(canvasModel);
    }
    return (
        <div>
            <div>{canvasModel.currentTool.currentPos.x}, {canvasModel.currentTool.currentPos.y}</div>
            <span><Button onClick={select}>Pixel</Button><Button onClick={rect}>Rect</Button></span>
            <div style={{minHeight: "20px"}}></div>
            <canvas style={{border: 'solid black 1px'}} ref={canvasRef} id="canvas1" width={imageWidth*pixelSize} height={imageHeight*pixelSize} onMouseMove={mouseMove} onMouseDown={mouseDown} onMouseUp={mouseUp}>Editor Canvas</canvas>
            <canvas style={{border: 'solid black 1px'}} id="canvas2" width={imageWidth} height={imageHeight}>Preview Canvas</canvas>
        </div>
    );
}