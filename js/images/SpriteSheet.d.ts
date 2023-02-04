import { Drawable } from "./Drawable.js";
declare const SpriteSheetOptions: {
    cellWidth: number;
    cellHeight: number;
};
export declare class SpriteSheet extends Drawable {
    options: typeof SpriteSheetOptions;
    horizontalCount: number;
    cursor: number;
    loopOrigin: number;
    tileInLoop: number;
    savedLoop: Map<string, [number, number]>;
    constructor(image: HTMLImageElement, options?: typeof SpriteSheetOptions);
    XYToIndex(x: number, y: number): number;
    indexToXY(index: any): [number, number];
    saveLoop(name: string, loopOrigin: number, tileInLoop: number): void;
    useLoop(name: string, index?: number): void;
    isLoop(name: string): boolean;
    setLoop(loopOrigin: number, tileInLoop: number, startIndex?: number): void;
    getLoopIndex(): number;
    next(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export {};
