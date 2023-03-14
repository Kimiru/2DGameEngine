import { Transform } from "../math/Transform.js";
import { matrix } from "../math/TransformMatrix.js";
import { Vector } from "../math/Vector.js";
import { GameScene, RenderingType } from "./GameScene.js";
/**
 * The GameObject class is the base brick class of the system, inhert from it to create any comonent of your system
 * Use the tags to retrieve groups of it from the scene perspective, children or not.
 */
export declare class GameObject {
    #private;
    id: number;
    children: GameObject[];
    tags: string[];
    updateEnabled: boolean;
    childrenUpdateEnabled: boolean;
    physicsEnabled: boolean;
    childrenPhysicsEnabled: boolean;
    drawEnabled: boolean;
    childrenDrawEnabled: boolean;
    nbvc: Map<any, any>;
    parent: GameObject;
    transform: Transform;
    zIndex: number;
    drawRange: number;
    renderingType: RenderingType;
    /**
     * Create a new raw GameObject
     */
    constructor();
    /**
     * If the object or any parent object is in the scene, returns it
     *
     * @returns {GameScene}
     */
    get scene(): GameScene;
    /**
     * Set the scene of the object
     * Used by GameScene
     *
     * @param {GameScene} scene
     */
    set scene(scene: GameScene);
    /**
     * @returns {GameEngine}
     */
    get engine(): import("./GameEngine.js").GameEngine;
    /**
     * @returns {Input}
     */
    get input(): import("./Input.js").Input;
    /**
     * Return true if object is either in a scene or has a parent object
     */
    get used(): boolean;
    get position(): Vector;
    get rotation(): number;
    set rotation(rotation: number);
    get size(): Vector;
    /**
     * Adds one or more tag to the object
     *
     * @param {...string} tag
     */
    addTag(...tag: string[]): void;
    /**
     * Removes one or more tag from the object
     *
     * @param {...string} tag
     */
    removeTag(...tag: string[]): void;
    /**
     * Add the given object to this object children
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    add(...object: GameObject[]): this;
    /**
     * Remove the given objects from this object children
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    remove(...object: GameObject[]): this;
    /**
     * Is called when the object is added to a scene or another object
     * Is to be modified by the user
     * Should not be called by the user
     */
    onAdd(): void;
    /**
     * Is called when the object is removed from a scene or a parent object
     * Is to be modified by the user
     * Should not be called by the user
     */
    onRemove(): void;
    getComponent<T extends GameComponent>(componentTag: string): T | null;
    getComponents<T extends GameComponent>(componentTag: string): T[];
    doIf(predicate: () => boolean): void;
    updateIf(predicate: () => boolean): void;
    /**
    * Update the object and its child.
    * Is called by the Scene or parent objects to update this object.
    * Should not be called by the user.
    *
    * @param {number} dt
    */
    executeUpdate(dt: number): void;
    physicsIf(predicate: () => boolean): void;
    executePhysics(dt: number): void;
    childrenDrawFilter(children: GameObject[]): GameObject[];
    drawIf(predicate: () => boolean): void;
    /**
    * Draw the object and its child.
    * Is called by the Scene or parent objects to draw this object.
    * Should not be called by the user.
    *
    * @param {number} dt
    */
    executeDraw(ctx: CanvasRenderingContext2D, drawRange: number, cameraPosition: Vector): void;
    /**
     * Update the object specific operation
     *
     * Is called when the object is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    update(dt: number): void;
    /**
     * Update the physics of the object
     *
     * Is called when the object physics is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    physics(dt: number): void;
    /**
      * Draw the object specific element
      *
      * Is called when the object is drawn
      * Is to be modified by the user
      * Should not be called by the user
      *
      * @param {CanvasRenderingContext2D} ctx
      */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Remove the object from its scene/parent
     */
    kill(): void;
    /**
     * Postpone the drawing of the object to after its children drawing
     */
    drawAfterChildren(): void;
    /**
     * Return the world position of this object, thus taking into account all parent object
     *
     * @returns {Vector}
     */
    getWorldPosition(defaultPosition?: Vector): Vector;
    /**
     * Return the world rotation of this object, thus taking into account all parent object
     *
     * @returns {number}
     */
    getWorldRotation(): number;
    getWorldTransformMatrix(): matrix;
}
export declare class GameComponent extends GameObject {
    unique: boolean;
    componentTag: string;
    constructor(componentTag: string);
}
