import { GameObject } from "../basics/GameObject.js";
export class Label extends GameObject {
    text = '';
    align = 'left';
    fontSize = 12;
    font = 'sans-serif';
    color = 'white';
    baseline = 'middle';
    maxWidth = 300;
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
    constructor(text, align, fontSize, font, color, baseline, maxWidth) {
        super();
        this.text = text;
        this.align = align;
        this.fontSize = fontSize;
        this.font = font;
        this.color = color;
        this.baseline = baseline;
        this.maxWidth = maxWidth;
        this.drawAfterChildren();
    }
    draw(ctx) {
        ctx.save();
        ctx.textAlign = this.align;
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.textBaseline = this.baseline;
        ctx.fillStyle = this.color;
        let text = typeof this.text === 'string' ? this.text : this.text();
        ctx.scale(1, -1);
        ctx.fillText(text, 0, 0, this.maxWidth);
        ctx.restore();
    }
}
