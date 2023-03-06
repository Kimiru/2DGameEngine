import { GameObject } from "../basics/GameObject.js";
import { drawText } from "./Utils.js";
export class Label extends GameObject {
    text = '';
    options = {};
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
    constructor(text, options = {}) {
        super();
        this.text = text;
        this.options = options;
        this.drawAfterChildren();
    }
    draw(ctx) {
        drawText(ctx, this.text, this.options);
    }
}
