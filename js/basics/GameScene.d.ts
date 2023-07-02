import { Camera } from "../camera/Camera.js";
import { Vector } from "../math/Vector.js";
import { GameEngine } from "./GameEngine.js";
import { GameObject } from "./GameObject.js";
export declare enum RenderingType {
    INFINITY = 0,
    IN_VIEW = 1
}
/**
 * GameScene is the class responsible for all the scene related operation such as camera definition, object adding, object grouping, scene update and rendering.
 * GameScene id is not used for scene unicity but for scene sorting regarding Network.
 * If you need multiple instance of the same scene, make sure ids are different but deterministic.
 * The deteministic side is needed when working with the Network
 * It is recommended to instanciate all your scene at the beginning if possible
 */
export declare class GameScene {
    static list: Map<string, GameScene>;
    id: string;
    tags: Map<string, GameObject[]>;
    children: GameObject[];
    camera: Camera | null;
    engine: GameEngine | null;
    parentScene: GameScene | null;
    renderingType: RenderingType;
    /**
     * Create a new empty GameScene
     */
    constructor(parentScene?: GameScene | null);
    store(): void;
    exit(): void;
    /**
     * Execute the scene update when not in use by an engine.
     * Still requires an engine as a reference point.
     */
    executeBlindUpdate(engine: GameEngine, dt: number): void;
    /**
     * Execute the scene physics when not in use by an engine.
     * Still requires an engine as a reference point.
     */
    executeBlindPhysics(engine: GameEngine, dt: number): void;
    /**
     * Update the scene and its child
     * Is called by the GameEngine to update the scene
     * Should not be called by the user
     *
     * @param {number} dt
     */
    executeUpdate(dt: number): void;
    executePhysics(dt: number): void;
    childrenDrawFilter(children: GameObject[]): GameObject[];
    getDrawRange(): number;
    getCameraPosition(): Vector;
    /**
     * Draw the scene and its children (children first)
     * Is called by the GameEngine to draw the scene
     * Should not be called by the user
     *
     * @param ctx
     */
    executeDraw(ctx: CanvasRenderingContext2D): void;
    /**
     * Add one or more object to the scene sorting them out by their tages, removing them from previous parent/scene if needed
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    add(...object: GameObject[]): this;
    /**
     * Sort the given objects and their children by their tags
     * Should not be called by the user
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    addTags(...object: GameObject[]): this;
    /**
     * Remove one or more from the scene, object should be in the scene
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    remove(...object: GameObject[]): this;
    /**
     * Remove the given objects and their children from the tag sorting lists
     * Should not be called by the user
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    removeTags(...object: GameObject[]): this;
    /**
     * Get an immutable array of all the object using the given tag
     *
     * @param {string} tag
     * @returns {GameObject[]}
     */
    getTags(tag: string): GameObject[];
    /**
     * Is called when the scene is set to a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onSet(): void;
    /**
     * Is called when the scene is unset from a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onUnSet(): void;
    /**
     * Is called when the canvas viewport changes when used by a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} width
     * @param {number} height
     */
    onResize(width: number, height: number): void;
    /**
     * Update the scene specific operation
     *
     * Is called when the scene is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    update(dt: number): void;
    /**
     * Update the scene physics specific operation
     *
     * Is called when the scene physics is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    physics(dt: number): void;
    /**
     * Draw the scene specific element
     *
     * Is called when the scene is drawn
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx: CanvasRenderingContext2D): void;
}
