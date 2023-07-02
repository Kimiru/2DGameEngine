import { textoptions } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
export declare class CheckBox extends GameObject {
    checked: boolean;
    rect: Rectangle;
    options: textoptions;
    sound: string | null;
    constructor(checked?: boolean, options?: textoptions, sound?: string | null);
    update(dt: number): void;
    onChange(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
