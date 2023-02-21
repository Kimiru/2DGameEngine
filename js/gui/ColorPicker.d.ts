import { GameObject } from '../basics/GameObject.js';
export declare class ColorPicker extends GameObject {
    h: number;
    s: number;
    l: number;
    draw(ctx: CanvasRenderingContext2D): void;
}
