import React, { useEffect } from "react";
import { Button, Divider, Flex, Text } from "@mantine/core";
import { LineTool, PixelPencilTool } from "../model/tool";
import Toolbar from "./Toolbar";
import { EditorState, useEditorState } from "../model/useEditorState";
import { Region } from "../model/common";
import { initPixelData } from "../model/canvasmodel";

function copyImage(state: EditorState) {
    const ctx = (document.getElementById("canvas2") as HTMLCanvasElement)?.getContext("2d");
    const imageData = ctx!.createImageData(state.size.width, state.size.height);
    state.previewBuffer.copyFrom(state.mergedCommittedBuffer);
    if (state.currentBuffer)
        state.previewBuffer.mergeWith(state.currentBuffer!);
    imageData.data.set(state.previewBuffer.data);
    ctx?.putImageData(imageData, 0, 0);
}

function drawCanvas(state: EditorState, ctx: CanvasRenderingContext2D, region: Region | null) {
    let now = Date.now();
    if (region) {
        ctx.clearRect(region.x * state.pixelSize, region.y * state.pixelSize,
            region.width * state.pixelSize, region.height * state.pixelSize);
    }
    else {
        ctx.clearRect(0, 0, state.size.width * state.pixelSize, state.size.height * state.pixelSize);
    }
    const pixelData = initPixelData(state.size.width, state.size.height, 'final');
    pixelData.mergeWith(state.transparentLayerBuffer);
    pixelData.mergeWith(state.mergedCommittedBuffer);

    if (state.currentBuffer) {
        pixelData.mergeWith(state.currentBuffer);
    }
    pixelData.mergeWith(state.pointerBuffer);
    console.log('step1', Date.now() - now);
    now = Date.now();
    pixelData.drawOnCanvas(ctx, state.pixelSize, region);
    console.log('step2', Date.now() - now);
}

export const EditorCanvas = () => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [id, setId] = React.useState(0);

    const state = useEditorState();
    const width = state.size.width * state.pixelSize;
    const height = state.size.height * state.pixelSize;
    console.log('test');
    useEffect(() => {
        drawCanvas(state, canvasRef.current?.getContext("2d")!, null);
    }, [])

    const mouseMove = (e: React.MouseEvent) => {
        state.currentTool.mouseMove(e, state);
        drawCanvas(state, canvasRef.current?.getContext("2d")!, state.currentTool.dirtyRegion);
        copyImage(state);
        e.preventDefault();
        e.stopPropagation();
        setId(id + 1);
    };

    const mouseDown = (e: React.MouseEvent) => {
        state.startBuffer();
        state.currentTool.mouseDown(e, state);
        drawCanvas(state, canvasRef.current?.getContext("2d")!, null);
        e.preventDefault();
        e.stopPropagation();
        setId(id + 1);
    };

    const mouseUp = (e: React.MouseEvent) => {
        state.currentTool.mouseUp(e, state);
        if (!state.currentLayer || !state.currentBuffer) return;

        state.currentLayer.pushBuffer(state.currentBuffer);
        state.mergeBuffers();
        drawCanvas(state, canvasRef.current?.getContext("2d")!, state.currentTool.dirtyRegion);

        e.preventDefault();
        e.stopPropagation();
        copyImage(state);
        setId(id + 1);
    };
    const select = () => {
        state.setCurrentTool(PixelPencilTool);
        PixelPencilTool.start(state);
        state.startBuffer();
    }
    const rect = () => {
        //canvasModel.currentTool = RectTool;
        //canvasModel.currentTool.start(canvasModel);
    }
    const line = () => {
        state.setCurrentTool(LineTool);
        LineTool.start(state);
        state.startBuffer();
        //canvasModel.currentTool = LineTool;
        //canvasModel.currentTool.start(canvasModel);
    }
    const circle = () => {
        //canvasModel.currentTool = CircleTool;
        //canvasModel.currentTool.start(canvasModel);
    }
    return (
        <div>
            <div>{state.currentTool.currentPos.x}, {state.currentTool.currentPos.y}</div>
            <span><Button onClick={select}>Pixel</Button><Button onClick={rect}>Rect</Button>
                <Button onClick={line}>Line</Button>
                <Button onClick={circle}>Circle</Button>
            </span>
            <div style={{ minHeight: "20px" }}></div>
            <Flex
                mih={50}
                gap="xs"
                justify="start"
                align="start"
                direction="row"
                wrap="wrap"
            >
                <Toolbar />
                <div style={{ display: 'flex' }}>
                    <canvas style={{ border: 'solid black 1px', cursor: 'crosshair' }} ref={canvasRef} id="canvas1"
                        width={width} height={height} onMouseMove={mouseMove} onMouseDown={mouseDown} onMouseUp={mouseUp}>Editor Canvas</canvas>
                </div>
                <div style={{ width: "200px", height: '100%', display: 'flex', flexDirection: 'column' }} >
                    <div>
                        <div><Text size="xs">Preview</Text></div>
                        <canvas style={{ border: 'solid black 1px' }} id="canvas2" width={state.size.width}
                            height={state.size.height}>Preview Canvas</canvas>
                        <Divider my="xs" />
                        <div><Text size="xs">Properties</Text></div>
                    </div>
                </div>

            </Flex>

            <canvas style={{ border: 'solid black 1px', visibility: 'hidden' }} id="canvas3"
                width={state.size.width} height={state.size.height}></canvas>
        </div>
    );
}