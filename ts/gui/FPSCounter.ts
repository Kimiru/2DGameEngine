import { GameObject } from "../basics/GameObject.js"
import { Timer } from "../math/Timer.js"

/**
 * The FPSCounter class is, as its name says, used to display the number of FPS of the game on the top left corner of the screen in a given font size
 */
export class FPSCounter extends GameObject {

    timer = new Timer()
    frameCount = 0
    fps = 0
    fontSize: number = 12

    /**
     * Create a new FPSCounter with a given font size
     * 
     * @param fontsize 
     */
    constructor(fontsize: number = 10) {

        super()

        this.fontSize = fontsize

    }

    /**
     * Update the timer
     * Should not be called by the user
     * 
     * @param {number} dt 
     * @returns {boolean}
     */
    update(dt: number) {

        this.frameCount++

        if (this.timer.greaterThan(1000)) {

            this.fps = this.frameCount
            this.frameCount = 0
            this.timer.reset()

        }

        return true

    }

    /**
     * Draw the timer on the top left corner
     * Should not be called by the user
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @return {boolean}
     */
    draw(ctx: CanvasRenderingContext2D): boolean {


        ctx.save()

        let engine = this.engine

        ctx.translate(-engine.usableWidth / 2, engine.usableHeight / 2)

        ctx.scale(1, -1)

        ctx.font = `${this.fontSize}px sans-serif`
        ctx.fillStyle = 'red'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(this.fps.toString(), this.fontSize / 2, this.fontSize / 2)

        ctx.restore()

        return true

    }

}