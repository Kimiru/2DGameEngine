import { GameObject } from "../basics/GameObject.js";
export declare class MouseCursor extends GameObject {
    constructor();
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
