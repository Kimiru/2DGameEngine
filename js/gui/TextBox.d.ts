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
    onSound: string | null;
    offSound: string | null;
    placeholder: stringable;
    constructor(placeholder?: stringable, options?: textoptions, onSound?: string | null, offSound?: string | null);
    toggleOn(): void;
    toggleOff(): void;
    toggle(): void;
    onChange(text: string): void;
    update(dt: number): void;
    postDraw(ctx: CanvasRenderingContext2D): void;
}
