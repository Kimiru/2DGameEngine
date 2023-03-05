import { stringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
export declare class Label extends GameObject {
    text: stringable;
    align: CanvasTextAlign;
    fontSize: number;
    font: string;
    color: stringable;
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
    constructor(text: stringable, align: CanvasTextAlign, fontSize: number, font: string, color: stringable, baseline: CanvasTextBaseline, maxWidth: number);
    draw(ctx: CanvasRenderingContext2D): void;
}
