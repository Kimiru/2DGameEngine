import { GameObject, TextBox } from '../2DGameEngine.js';
export declare class ColorPicker extends GameObject {
    htb: TextBox;
    stb: TextBox;
    ltb: TextBox;
    h: number;
    s: number;
    l: number;
    constructor();
    getHSLColor(): string;
    getHSL(): [number, number, number];
    importHSL(h: number, s: number, l: number): void;
    getRGBColor(): string;
    getRGB(): [number, number, number];
    importRGB(r: number, g: number, b: number): void;
    getHexColor(): string;
    importHexColor(hexColor: string): void;
    onChange(h: number, s: number, l: number): void;
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
