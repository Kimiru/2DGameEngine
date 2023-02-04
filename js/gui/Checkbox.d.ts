import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
export declare class CheckBox extends GameObject {
    checked: boolean;
    rect: Rectangle;
    rectColor: string;
    checkColor: string;
    size: number;
    sound: string;
    constructor(checked?: boolean, size?: number, rectColor?: string, checkColor?: string, sound?: string);
    update(dt: number): void;
    onChange(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
