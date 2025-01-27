export type Size = {
    width: number;
    height: number;
}

export type Pos2 = {
    x: number;
    y: number;
}

export type Region = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function getRegion(pos1: Pos2, pos2: Pos2): Region {
    const x = Math.min(pos1.x, pos2.x) - 10;
    const y = Math.min(pos1.y, pos2.y) - 10;
    const width = Math.abs(pos2.x - pos1.x) + 10;
    const height = Math.abs(pos2.y - pos1.y) + 10;
    return { x, y, width, height };
}