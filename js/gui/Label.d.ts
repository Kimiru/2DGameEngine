import { stringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { textoptions } from "./Utils.js";
export declare class Label extends GameObject {
    text: stringable;
    options: textoptions;
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
    constructor(text: stringable, options?: textoptions);
    postDraw(ctx: CanvasRenderingContext2D): void;
}
