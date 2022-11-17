import { GameObject, Timer } from "./2DGameEngine";
import { Rectangle } from "./2DGEGeometry";
/**
 * The FPSCounter class is, as its name says, used to display the number of FPS of the game on the top left corner of the screen in a given font size
 */
export declare class FPSCounter extends GameObject {
    timer: Timer;
    frameCount: number;
    fps: number;
    fontSize: number;
    /**
     * Create a new FPSCounter with a given font size
     *
     * @param fontsize
     */
    constructor(fontsize?: number);
    /**
     * Update the timer
     * Should not be called by the user
     *
     * @param {number} dt
     * @returns {boolean}
     */
    update(dt: number): boolean;
    /**
     * Draw the timer on the top left corner
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     * @return {boolean}
     */
    draw(ctx: CanvasRenderingContext2D): boolean;
}
export declare class MouseCursor extends GameObject {
    constructor();
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
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
export declare class Button extends GameObject {
    #private;
    text: string;
    rect: Rectangle;
    get active(): boolean;
    fontSize: number;
    font: string;
    width: number;
    color: string;
    activeColor: string;
    onSound: string;
    constructor(fontSize: number, width: number, font?: string, color?: string, onSound?: string, margin?: number);
    get currentColor(): string;
    update(dt: number): void;
    onActive(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class Label extends GameObject {
    text: string;
    align: CanvasTextAlign;
    fontSize: number;
    font: string;
    color: string;
    baseline: CanvasTextBaseline;
    maxWidth: number;
    /**
     *
     * @param {string} text
     * @param {CanvasTextAlign} align
     * @param {number} fontSize
     * @param {string} font
     * @param {string} color
     * @param {CanvasTextBaseline} baseline
     * @param {number} maxWidth
     */
    constructor(text: string, align: CanvasTextAlign, fontSize: number, font: string, color: string, baseline: CanvasTextBaseline, maxWidth: number);
    draw(ctx: CanvasRenderingContext2D): void;
}
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
