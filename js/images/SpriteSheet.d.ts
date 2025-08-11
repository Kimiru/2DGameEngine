import { Drawable } from "./Drawable.js";
declare const SpriteSheetOptions: {
    images: Array<HTMLImageElement>;
    cellWidth: number;
    cellHeight: number;
};
export declare class SpriteSheet extends Drawable {
    options: typeof SpriteSheetOptions;
    horizontalCount: number;
    cursor: number;
    loopOrigin: number;
    tileInLoop: number;
    fps: number;
    lastFps: number;
    savedLoop: Map<string, [number, number, number]>;
    constructor(options?: typeof SpriteSheetOptions);
    XYToIndex(x: number, y: number): number;
    indexToXY(index: any): [number, number];
    saveLoop(name: string, loopOrigin: number, tileInLoop: number, fps: number): void;
    useLoop(name: string, index?: number): void;
    isLoop(name: string): boolean;
    setLoop(loopOrigin: number, tileInLoop: number, fps: number, startIndex?: number): void;
    getLoopIndex(): number;
    next(): void;
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export {};
