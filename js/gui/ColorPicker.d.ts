import { Color, GameObject, TextBox } from '../2DGameEngine.js';
export declare class ColorPicker extends GameObject {
    color: Color;
    htb: TextBox;
    stb: TextBox;
    ltb: TextBox;
    constructor();
    onChange(color: Color): void;
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
