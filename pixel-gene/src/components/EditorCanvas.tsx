import React, { useEffect } from "react";
import { Divider, Flex, Group, Text } from "@mantine/core";
import { LineTool, PixelPencilTool } from "../model/tool";
import Toolbar from "./Toolbar";
import { EditorState, useEditorState } from "../model/useEditorState";
import { Region } from "../model/common";
import { initPixelData } from "../model/canvasmodel";
import { MENU_HEIGHT } from "./MenuBar";
import ToolbarButton from "./ToolbarButton";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconBrandFunimation, IconCircle, IconCopy, IconDeviceVisionPro, IconFrame, IconNews, IconPencil, IconPlayerPause, IconPlayerPlay, IconPlayerStop, IconPlus, IconPlusEqual, IconSeparator, IconSquare, IconTrash, IconVideo } from "@tabler/icons-react";

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
    centerEditorCanvas(state);

    let now = Date.now();
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    if (region) {
        ctx.clearRect(region.x * state.pixelSize, region.y * state.pixelSize,
            region.width * state.pixelSize, region.height * state.pixelSize);
    }
    else {
        ctx.clearRect(0, 0, state.size.width * state.pixelSize, state.size.height * state.pixelSize);
    }
    //ctx.clearRect(0, 0, state.size.width * state.pixelSize, state.size.height * state.pixelSize);
    const pixelData = initPixelData(state.size.width, state.size.height, 'final');
    // pixelData.mergeWith(state.transparentLayerBuffer);
    pixelData.mergeWith(state.mergedCommittedBuffer);

    if (state.currentBuffer) {
        pixelData.mergeWith(state.currentBuffer);
    }
    pixelData.mergeWith(state.pointerBuffer);
    // console.log('step1', Date.now() - now);
    now = Date.now();
    pixelData.drawOnCanvas(ctx, state.pixelSize, null);
    // console.log('step2', Date.now() - now);
}

function drawBackgroundLayer(state: EditorState) {
    if (!state.backgroundCanvas) return;
    const ctx = state.backgroundCanvas.getContext("2d")!;
    if (!ctx) return;

    for (let r = 0; r < state.size.height; r++) {
        for (let c = 0; c < state.size.width; c++) {
            const color = (r + c) % 2 === 0 ? "white" : "lightgray";
            ctx.fillStyle = color;
            ctx.fillRect(c, r, 1, 1);
        }
    }
}

export function centerEditorCanvas(state: EditorState) {
    if (!state.viewCanvas) return;
    // state.viewCanvas!.style.left = `${(parentWidth - width) / 2}px`;
    // state.viewCanvas!.style.top = `${(parentHeight - height) / 2}px`;

    state.backgroundCanvas!.style.left = state.viewCanvas.style.left;
    state.backgroundCanvas!.style.top = state.viewCanvas.style.top;
}

const bottomHeight = 250;

export const EditorCanvas = () => {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const backgroundCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const [id, setId] = React.useState(0);

    const state = useEditorState();
    const width = state.size.width * state.pixelSize;
    const height = state.size.height * state.pixelSize;

    useEffect(() => {
        if (!canvasRef.current || !backgroundCanvasRef.current) return;
        state.setCanvases(canvasRef.current!, backgroundCanvasRef.current!);
        drawBackgroundLayer(state);
        drawCanvas(state, canvasRef.current?.getContext("2d")!, null);
    }, [canvasRef.current, backgroundCanvasRef.current]);

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
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: `calc(100vh - ${MENU_HEIGHT}px - 20px)` }}>
            <div style={{ display: "flex", flex: 1 }} id="top-part">
                <div id="top-left" style={{ display: "flex", flexDirection: "row", flex: "1" }}>
                    <Toolbar />
                    <div style={{
                        backgroundColor: "gray", padding: "10px", margin: "0px 5px", flex: 1, position: "relative",
                        overflow: "auto", height: `calc(100vh - ${bottomHeight + 20}px)`, display: 'flex', alignItems: "center", justifyContent: "center"
                    }}>
                        <canvas style={{
                            margin: "0px", imageRendering: 'pixelated', position: "absolute",
                            cursor: 'crosshair', width: width, height: height, pointerEvents: "none",
                            zIndex: 1
                        }}
                            ref={backgroundCanvasRef} id="backgroundCanvas" width={state.size.width} height={state.size.height}>
                        </canvas>
                        <canvas style={{
                            margin: "0px", imageRendering: 'pixelated', cursor: 'crosshair',
                            width: width, height: height, zIndex: 2
                        }}
                            ref={canvasRef} id="canvas1" width={state.size.width} height={state.size.height}
                            onMouseMove={mouseMove} onMouseDown={mouseDown} onMouseUp={mouseUp}></canvas>
                    </div>
                </div>
                <div id="top-right">
                    <div style={{ width: "200px", height: '90%', display: 'flex', flexDirection: 'column' }} >
                        <div>
                            <div><Text size="xs">Preview</Text></div>
                            <canvas style={{ border: 'solid black 1px' }} id="canvas2" width={state.size.width}
                                height={state.size.height}>Preview Canvas</canvas>
                            <Divider my="xs" />
                            <div><Text size="xs">Properties</Text></div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height: `${bottomHeight}px` }} id="bottom-part">
                <BottomBar></BottomBar>
            </div>
        </div>
    );
}

const BottomBar: React.FC<{}> = () => {
    return <div style={{ height: "30px", width: "100%" }}>
        <Flex
            mih={50}
            pl={48}
            pt={5}
            gap="2"
            justify="flex-start"
            align="flex-start"
            direction="row"
            wrap="wrap"
        >
            <Group gap="xs">
                <Group gap={"2"}>
                    <ToolbarButton selected={false} variant="default"><IconPlus size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconCopy size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconTrash size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconArrowUp size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconArrowDown size={15} /></ToolbarButton>
                </Group>
                <Divider orientation="vertical" />
                <Group gap={"2"}>
                    <ToolbarButton selected={false} variant="default"><IconFrame size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconTrash size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconArrowLeft size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconArrowRight size={15} /></ToolbarButton>
                </Group>
                <Divider orientation="vertical" />
                <Group gap={"2"}>
                    <ToolbarButton selected={false} variant="default"><IconPlayerPlay size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconPlayerPause size={15} /></ToolbarButton>
                    <ToolbarButton selected={false} variant="default"><IconPlayerStop size={15} /></ToolbarButton>
                </Group>
            </Group>
        </Flex>
    </div>
}