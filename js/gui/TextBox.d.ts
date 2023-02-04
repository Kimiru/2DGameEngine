import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
export declare class TextBox extends GameObject {
    text: string;
    active: boolean;
    rect: Rectangle;
    fontSize: number;
    font: string;
    width: number;
    color: string;
    onSound: string;
    offSound: string;
    placeholder: string;
    constructor(fontSize: number, width: number, font?: string, color?: string, onSound?: string, offSound?: string);
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
