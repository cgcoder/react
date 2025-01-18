import React from "react";
import { newCanvas } from "../model/canvasmodel";
import { Button } from "@mantine/core";
import { RectTool } from "../model/tool";

const pixelSize = 15;
let gridValues = new Array<Array<number>>();
let imageWidth = 100;
let imageHeight = 50;

function initGridValues(rows: number, cols: number) {
    gridValues = new Array<Array<number>>(rows);
    for (let i = 0; i < rows; i++) {
        gridValues[i] = new Array<number>(cols);
        for (let j = 0; j < cols; j++) {
            gridValues[i][j] = 0xFFFFFFFF;
        }
    }
}

function numberToColorComponents(num: number) {
    return {
        r: (num >> 24) & 0xFF,
        g: (num >> 16) & 0xFF,
        b: (num >> 8) & 0xFF,
        a: num & 0xFF
    }
}
initGridValues(imageHeight, imageWidth);

function copyImage() {
    const ctx = (document.getElementById("canvas2") as HTMLCanvasElement)?.getContext("2d");
    const imageData = ctx!.createImageData(imageWidth, imageHeight);
    for (let r = 0; r < imageHeight; r++) {
        for (let c = 0; c < imageWidth; c++) {
            const comp = numberToColorComponents(gridValues[r][c]);
            if (gridValues[r][c] !== 0xFFFFFFFF) {
                console.log(gridValues[r][c], r, c, comp);
            }
            const i = (r*imageHeight + c)*4;
            imageData.data[i] = comp.r;
            imageData.data[i+1] = comp.g;
            imageData.data[i+2] = comp.b;
            imageData.data[i+3] = 255; //Math.ceil(comp.a*255);
        }
    }
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
        const pixelData = canvasModel.currentTool.commit(canvasModel);
        canvasModel.pixelDataList.push(pixelData);
        canvasModel.pixelData.mergeWith(pixelData);
        canvasModel.currentTool.mouseUp(e, canvasModel);
        canvasModel.drawOnCanvas(canvasRef.current?.getContext("2d")!);

        e.preventDefault();
        e.stopPropagation();
        setIdx(idx + 1);
    };
    const select = () => {
        canvasModel.currentTool.start(canvasModel);
    }
    const rect = () => {
        canvasModel.currentTool = RectTool;
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