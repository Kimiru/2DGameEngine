import { stringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
import { textoptions } from "./Utils.js";
export declare class Button extends GameObject {
    #private;
    text: stringable;
    rect: Rectangle;
    get active(): boolean;
    options: textoptions;
    color: stringable;
    activeColor: stringable;
    onSound: string;
    constructor(text: stringable, options?: textoptions, onSound?: string, margin?: number);
    get currentColor(): string;
    update(dt: number): void;
    onClick(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
