import { stringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
export declare class CheckBox extends GameObject {
    checked: boolean;
    rect: Rectangle;
    rectColor: stringable;
    checkColor: stringable;
    size: number;
    sound: string;
    constructor(checked?: boolean, size?: number, rectColor?: stringable, checkColor?: stringable, sound?: string);
    update(dt: number): void;
    onChange(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
