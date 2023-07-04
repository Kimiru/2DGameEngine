import { Vector } from "../math/Vector.js";
import { GameScene } from "./GameScene.js";
import { Input } from "./Input.js";
import { imageBank, soundBank, svgBank } from "./Utils.js";
/**
 * GameEngine is the class responsible for the execution of the game loop, the canvas and resize change, and the scene management
 */
export declare class GameEngine {
    #private;
    /**
     * The canvas on which the GameEngine will draw.
     * Shall not be modified.
     * Can be accessed to retrieved generated canvas if none is passed as argument.
     */
    canvas: HTMLCanvasElement;
    /**
     * The context on which the GameEngine will draw.
     * Shall not be modified.
     */
    ctx: CanvasRenderingContext2D;
    /**
     * The input is here to query the keyboard inputs and the mouse inputs.
     */
    input: Input;
    timeScale: number;
    /**
     * Contains all the images loaded at the engine contruction.
     */
    imageBank: imageBank;
    /**
     * Contains all the svg loaded at the engine construction.
     */
    svgBank: svgBank;
    /**
     * Contains all the sounds loaded at the engine construction.
     */
    soundBank: soundBank;
    /**
     * Create a new game engine using the given argument list, filling the gap with default value
     *
     * @param {width: number, height: number, verticalPixels: number, scaling: number, images: Image[]} args
     */
    constructor(args?: {
        width?: number | undefined;
        height?: number | undefined;
        verticalPixels: number;
        scaling?: number | undefined;
        canvas?: HTMLCanvasElement | null | undefined;
        images?: {
            name: string;
            src: string;
        }[] | undefined;
        svgs?: {
            name: string;
            src: string;
        }[] | undefined;
        sounds?: {
            name: string;
            srcs: string[];
            backup?: number | undefined;
        }[] | undefined;
    });
    get trueWidth(): number;
    get trueHeight(): number;
    get usableWidth(): number;
    get usableHeight(): number;
    get usableScale(): Vector;
    get verticalPixels(): number;
    get dt(): number;
    get scene(): GameScene | null;
    /**
     * update the size of both canvas
     * if a scene is curently used, update it's camera
     *
     * @param {number} width
     * @param {number} height
     */
    resize(width: number, height: number, scaling?: number, pixels?: number): void;
    /**
     * Set the number vertical virtual pixel.
     * i.e. if a 1x1 square is drawn, it will take 1/pixels the space
     *
     * @param {number} pixels
     */
    setVerticalPixels(pixels?: number): void;
    /**
     * Set the new scene to be displayed, can be null
     *
     * @param {GameScene | null} scene
     */
    setScene(scene: GameScene | null): void;
    /**
     * Start the engine, running the gameloop
     */
    start(): void;
    /**
     * Stop the engine, stopping the gameloop
     */
    stop(): void;
    onResourcesLoaded(callback: any): void;
}
export declare function fullScreen(engine: GameEngine): () => void;
export declare function fillCanvasParent(engine: GameEngine): () => void;
