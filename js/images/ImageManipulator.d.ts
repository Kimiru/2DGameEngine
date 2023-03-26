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
    static fromImage(image: HTMLImageElement): ImageManipulator;
    draw(ctx: CanvasRenderingContext2D): void;
}
