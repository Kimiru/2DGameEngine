import { GameObject } from "../basics/GameObject.js";
export declare class CompositeImageManipulator extends GameObject {
    canvases: HTMLCanvasElement[];
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
    clone(): CompositeImageManipulator;
    static fromImage(image: HTMLImageElement): CompositeImageManipulator;
    draw(ctx: CanvasRenderingContext2D): void;
}
