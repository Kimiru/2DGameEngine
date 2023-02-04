import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
export declare class Button extends GameObject {
    #private;
    text: string;
    rect: Rectangle;
    get active(): boolean;
    fontSize: number;
    font: string;
    width: number;
    color: string;
    activeColor: string;
    onSound: string;
    constructor(fontSize: number, width: number, font?: string, color?: string, onSound?: string, margin?: number);
    get currentColor(): string;
    update(dt: number): void;
    onActive(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
