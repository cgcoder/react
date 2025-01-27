import { create } from 'zustand';
import { Size } from './common';
import { PixelPencilTool, Tool } from './tool';
import { initPixelData, PixelData } from './canvasmodel';

export interface EditorState {
    size: Size;
    setSize: (size: Size) => void;

    pixelSize: number;
    setPixelSize: (n: number) => void;

    currentTool: Tool;
    setCurrentTool: (t: Tool) => void;

    layers: Array<CanvasLayer>;
    currentLayer: CanvasLayer | null;
    addLayer: () => void;
    removeLayer: (layerId: number) => void;
    setLayerVisibility: (layerId: number, visible: boolean) => void;

    transparentLayerBuffer: PixelData;

    currentBuffer: PixelData | null;
    startBuffer: () => void;

    pointerBuffer: PixelData;

    mergedCommittedBuffer: PixelData;
    mergeBuffers: () => void;

    previewBuffer: PixelData;
}

let layerIdSequence = 1;

function nextLayerId() {
    return layerIdSequence++;
}

export interface CanvasLayer {
    layerId: number;
    name: string;
    hidden: boolean;
    mergedCommittedBuffer: PixelData;
    committedBuffers: Array<PixelData>;
    setPixelDataVisibility: (pixelDataId: number, visible: boolean) => void;
    deletePixelData: (pixelDataId: number) => void;
    pushBuffer: (pixelData: PixelData) => void;
}

interface CanvasLayerInternal extends CanvasLayer {
    mergeBuffers: () => void;
}

export type ZustandSet = (partial: EditorState | Partial<EditorState> | ((state: EditorState)
    => EditorState | Partial<EditorState>), replace?: false | undefined) => void;

const setSize = (set: ZustandSet) => (size: Size) => set(() => ({ size: size }));
const setCurrentTool = (set: ZustandSet) => (tool: Tool) => set(() => ({ currentTool: tool }));
const setPixelSize = (set: ZustandSet) => (n: number) => set(() => ({ pixelSize: n }));

const addLayer = (set: ZustandSet) => () => {
    set((state) => {
        const layers = [...state.layers, newLayer(state.size.width, state.size.height)];
        return { layers: layers };
    })
}

const removeLayer = (set: ZustandSet) => (layerId: number) => {
    set((state) => {
        return { layers: state.layers.filter(l => l.layerId !== layerId) }
    })
}

const setLayerVisibility = (set: ZustandSet) => (layerId: number, visible: boolean) => {
    set((state) => {
        const foundLayerId = state.layers.findIndex(l => l.layerId === layerId);
        state.layers[foundLayerId].hidden = visible;
        return { layers: [...state.layers] };
    });
}

const startBuffer = (set: ZustandSet) => () => {
    set((state) => {
        return { currentBuffer: initPixelData(state.size.width, state.size.height, 'current') };
    })
}

const commitBuffer = (set: ZustandSet) => () => {
    set((state) => {
        if (!state.currentLayer || !state.currentBuffer) return {};
        const index = state.layers.indexOf(state.currentLayer);
        state.currentLayer.committedBuffers.push(state.currentBuffer);
        state.layers[index] = state.currentLayer;
        return { currentLayer: { ...state.currentLayer }, layers: [...state.layers] };
    })
}

const mergeBuffers = (set: ZustandSet) => () => {
    set((state) => {
        const newBuffer = initPixelData(state.size.width, state.size.height, 'merged');
        for (const layer of state.layers) {
            if (layer.hidden) continue;
            newBuffer.mergeWith(layer.mergedCommittedBuffer);
        }
        return { mergedCommittedBuffer: newBuffer }
    });
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 400;
const DEFAULT_PIXEL_SIZE = 5;

export const useEditorState = create<EditorState>(
    (set) => {
        const layer = newLayer(DEFAULT_WIDTH, DEFAULT_HEIGHT);

        return {
            size: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
            setSize: setSize(set),

            pixelSize: DEFAULT_PIXEL_SIZE,
            setPixelSize: setPixelSize(set),

            currentTool: PixelPencilTool,
            setCurrentTool: setCurrentTool(set),

            layers: [layer],
            currentLayer: layer,
            addLayer: addLayer(set),
            removeLayer: removeLayer(set),
            setLayerVisibility: setLayerVisibility(set),

            pointerBuffer: initPixelData(DEFAULT_WIDTH, DEFAULT_HEIGHT, "pointer"),

            transparentLayerBuffer: initPixelData(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'transparent'),

            currentBuffer: initPixelData(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'current'),
            startBuffer: startBuffer(set),
            commitBuffer: commitBuffer(set),

            mergedCommittedBuffer: initPixelData(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'merged'),
            mergeBuffers: mergeBuffers(set),

            previewBuffer: initPixelData(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'preview')
        };
    }
);

function newLayer(width: number, height: number): CanvasLayer {
    const layerId = nextLayerId();
    const obj: CanvasLayerInternal = {
        layerId: layerId,
        name: `Layer ${layerId}`,
        hidden: false,
        mergedCommittedBuffer: initPixelData(width, height, 'merged-layer-buffer'),
        committedBuffers: [],
        setPixelDataVisibility: function (id: number, visible: boolean) {
            const index = this.committedBuffers.findIndex(l => l.id === id);
            if (index < 0) return;

            this.committedBuffers[index].visible = visible;
            this.mergeBuffers();
        },
        deletePixelData: function (id: number) {
            this.committedBuffers = this.committedBuffers.filter(b => b.id !== id);
            this.mergeBuffers();
        },
        pushBuffer: function (pixel: PixelData) {
            this.committedBuffers.push(pixel);
            this.mergeBuffers();
        },
        mergeBuffers: function () {
            this.mergedCommittedBuffer.clear();
            for (let i = 0; i < this.committedBuffers.length; i++) {
                if (this.committedBuffers[i].visible) {
                    this.mergedCommittedBuffer.mergeWith(this.committedBuffers[i]);
                }
            }
        }
    };

    return obj;
}