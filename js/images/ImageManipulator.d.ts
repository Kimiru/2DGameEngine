import { Rectangle, Vector } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
export declare class ImageManipulator extends GameObject {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    constructor(width?: number, height?: number);
    get width(): number;
    get height(): number;
    setCtxToCenter(): void;
    setSize(width: number, height: number): void;
    setPixel(x: number, y: number, color: string): void;
    setPixelRGBA(x: number, y: number, r: number, g: number, b: number, a: number): void;
    getPixel(x: number, y: number): [number, number, number, number];
    print(): string;
    download(name: string, addSize?: boolean): void;
    getImage(): Promise<HTMLImageElement>;
    toString(): string;
    clone(): ImageManipulator;
    flipV(): this;
    flipH(): this;
    rotate270(): void;
    rotate90(): void;
    static fromImage(image: HTMLImageElement): ImageManipulator;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare const CANVAS_RESOLUTION = 2048;
export type RawLargeImageManipulator = {
    width: number;
    height: number;
    data: {
        x: number;
        y: number;
        image: string;
    }[];
};
export declare class LargeImageManipulator extends GameObject {
    canvases: {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        position: Vector;
    }[];
    fullSize: Vector;
    gridSize: Vector;
    constructor(width: number, height: number);
    updateSize(width: number, height: number): void;
    /**
     * Call the callback on each stored canvas, with the area associated.
     * Edge canvas are automatically clipped out.
     * area Rectangle is freely modifyable
     */
    run(callback: (ctx: CanvasRenderingContext2D, area: Rectangle) => void, invertVertical?: boolean): void;
    export(): Promise<RawLargeImageManipulator>;
    import(raw: RawLargeImageManipulator): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
