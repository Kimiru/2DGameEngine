import { stringable } from "../2DGameEngine.js"
import { GameObject } from "../basics/GameObject.js"
import { drawText, textoptions } from "./Utils.js"

export class Label extends GameObject {

    text: stringable = ''
    options: textoptions = {}

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
    constructor(text: stringable, options: textoptions = {}) {

        super()

        this.text = text
        this.options = options

    }

    postDraw(ctx: CanvasRenderingContext2D): void {

        drawText(ctx, this.text, this.options)

    }

}