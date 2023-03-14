import { stringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
import { textoptions } from "./Utils.js";
export declare class TextBox extends GameObject {
    #private;
    static lock: boolean;
    enabled: boolean;
    text: string;
    active: boolean;
    cursorPosition: number;
    rect: Rectangle;
    options: textoptions;
    onSound: string;
    offSound: string;
    placeholder: stringable;
    constructor(placeholder?: stringable, options?: textoptions, onSound?: string, offSound?: string);
    toggleOn(): void;
    toggleOff(): void;
    toggle(): void;
    onFinish(text: string): void;
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
