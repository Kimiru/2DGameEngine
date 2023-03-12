import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
import { ImageManipulator } from "./ImageManipulator.js";
export declare class Drawable extends GameObject {
    images: HTMLImageElement[];
    imageSize: Vector;
    halfSize: Vector;
    constructor(...images: HTMLImageElement[]);
    render(resolution?: Vector, margin?: number, smoothing?: boolean): ImageManipulator;
    draw(ctx: CanvasRenderingContext2D): void;
}
