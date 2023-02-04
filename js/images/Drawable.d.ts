import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
export declare class Drawable extends GameObject {
    images: HTMLImageElement[];
    size: Vector;
    halfSize: Vector;
    constructor(...images: HTMLImageElement[]);
    draw(ctx: CanvasRenderingContext2D): void;
}
