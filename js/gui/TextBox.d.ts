import { stringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
export declare class TextBox extends GameObject {
    static lock: boolean;
    enabled: boolean;
    text: string;
    active: boolean;
    rect: Rectangle;
    fontSize: number;
    font: string;
    width: number;
    color: stringable;
    onSound: string;
    offSound: string;
    align: CanvasTextAlign;
    baseline: CanvasTextBaseline;
    placeholder: stringable;
    constructor(fontSize: number, width: number, font?: string, color?: stringable, onSound?: string, offSound?: string);
    toggleOn(): void;
    toggleOff(): void;
    toggle(): void;
    onFinish(text: string): void;
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
