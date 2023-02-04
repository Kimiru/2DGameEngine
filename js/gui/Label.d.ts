import { GameObject } from "../basics/GameObject.js";
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
