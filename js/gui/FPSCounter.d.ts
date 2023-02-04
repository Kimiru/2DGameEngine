import { GameObject } from "../basics/GameObject.js";
import { Timer } from "../math/Timer.js";
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
