import { GameComponent } from "../components/GameComponent.js";
import { Transform } from "../math/Transform.js";
import { TransformMatrix } from "../math/TransformMatrix.js";
import { Vector } from "../math/Vector.js";
import { RenderingType } from "./GameScene.js";
import { id } from "./Utils.js";
const PI2 = Math.PI * 2;
/**
 * The GameObject class is the base brick class of the system, inhert from it to create any comonent of your system
 * Use the tags to retrieve groups of it from the scene perspective, children or not.
 */
export class GameObject {
    id = id();
    children = [];
    tags = ['$'];
    updateEnabled = true;
    childrenUpdateEnabled = true;
    physicsEnabled = true;
    childrenPhysicsEnabled = true;
    drawEnabled = true;
    childrenDrawEnabled = true;
    nbvc = new Map();
    parent = null;
    #scene = null;
    #drawBeforeChild = true;
    transform = new Transform();
    zIndex = 0;
    drawRange = 0; // If set to infinity, will always be rendered no matter the rendering style
    renderingType = RenderingType.INFINITY;
    /**
     * Create a new raw GameObject
     */
    constructor() {
    }
    /**
     * If the object or any parent object is in the scene, returns it
     *
     * @returns {GameScene}
     */
    get scene() { return this.#scene ?? this.parent?.scene ?? null; }
    /**
     * Set the scene of the object
     * Used by GameScene
     *
     * @param {GameScene} scene
     */
    set scene(scene) { this.#scene = scene; }
    /**
     * @returns {GameEngine}
     */
    get engine() { return this.scene?.engine ?? null; }
    /**
     * @returns {Input}
     */
    get input() { return this.engine?.input ?? null; }
    /**
     * Return true if object is either in a scene or has a parent object
     */
    get used() { return this.scene !== null || this.parent !== null; }
    /**
     * Adds one or more tag to the object
     *
     * @param {...string} tag
     */
    addTag(...tag) {
        this.tags.push(...tag);
    }
    /**
     * Removes one or more tag from the object
     *
     * @param {...string} tag
     */
    removeTag(...tag) {
        for (let t of tag) {
            let index = this.tags.indexOf(t);
            if (index !== -1)
                this.tags.splice(index, 1);
        }
    }
    /**
     * Add the given object to this object children
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    add(...object) {
        for (let obj of object)
            if (obj instanceof GameObject) {
                if (obj instanceof GameComponent && obj.unique && this.getComponent(obj.componentTag))
                    throw `Cannot add more than one unique component of type "${obj.componentTag}"`;
                if (obj.used)
                    obj.kill();
                obj.parent = this;
                this.children.push(obj);
                this.scene?.addTags(obj);
                obj.onAdd();
            }
        return this;
    }
    /**
     * Remove the given objects from this object children
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    remove(...object) {
        for (let obj of object)
            if (obj instanceof GameObject) {
                let index = this.children.indexOf(obj);
                if (index !== -1) {
                    this.scene?.removeTags(obj);
                    obj.parent = null;
                    this.children.splice(index, 1);
                    obj.onRemove();
                }
            }
        return this;
    }
    /**
     * Is called when the object is added to a scene or another object
     * Is to be modified by the user
     * Should not be called by the user
     */
    onAdd() { }
    /**
     * Is called when the object is removed from a scene or a parent object
     * Is to be modified by the user
     * Should not be called by the user
     */
    onRemove() { }
    getComponent(componentTag) {
        return this.children.find(child => child.tags.includes('component') &&
            child.tags.includes(componentTag)) ?? null;
    }
    getComponents(componentTag) {
        return this.children.filter(child => child.tags.includes('component') &&
            child.tags.includes(componentTag));
    }
    /**
    * Update the object and its child.
    * Is called by the Scene or parent objects to update this object.
    * Should not be called by the user.
    *
    * @param {number} dt
    */
    executeUpdate(dt) {
        if (this.updateEnabled)
            this.update(dt);
        if (this.childrenUpdateEnabled)
            for (let child of [...this.children])
                if (child instanceof GameObject)
                    child.executeUpdate(dt);
    }
    executePhysics(dt) {
        if (this.physicsEnabled)
            this.physics(dt);
        if (this.childrenPhysicsEnabled)
            for (let child of [...this.children])
                if (child instanceof GameObject)
                    child.executePhysics(dt);
    }
    childrenDrawFilter(children) { return children; }
    /**
    * Draw the object and its child.
    * Is called by the Scene or parent objects to draw this object.
    * Should not be called by the user.
    *
    * @param {number} dt
    */
    executeDraw(ctx, drawRange, cameraPosition) {
        ctx.save();
        ctx.transform(...this.transform.getMatrix());
        if (this.#drawBeforeChild && this.drawEnabled)
            this.draw(ctx);
        if (this.childrenDrawEnabled) {
            let children = this.childrenDrawFilter(this.children).sort((a, b) => a.zIndex != b.zIndex ? a.zIndex - b.zIndex : b.transform.translation.y - a.transform.translation.y);
            if (this.renderingType === RenderingType.INFINITY) {
                for (let child of children)
                    if (child instanceof GameObject)
                        child.executeDraw(ctx, drawRange, cameraPosition);
            }
            else if (this.renderingType === RenderingType.IN_VIEW) {
                for (let child of children) {
                    let childPosition = child.getWorldPosition();
                    let distance = cameraPosition.distanceTo(childPosition);
                    let maxChildRange = distance - drawRange;
                    if (child.drawRange >= maxChildRange && child instanceof GameObject)
                        child.executeDraw(ctx, drawRange, cameraPosition);
                }
            }
        }
        if (!this.#drawBeforeChild && this.drawEnabled)
            this.draw(ctx);
        ctx.restore();
    }
    /**
     * Update the object specific operation
     *
     * Is called when the object is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    update(dt) { }
    /**
     * Update the physics of the object
     *
     * Is called when the object physics is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    physics(dt) { }
    /**
      * Draw the object specific element
      *
      * Is called when the object is drawn
      * Is to be modified by the user
      * Should not be called by the user
      *
      * @param {CanvasRenderingContext2D} ctx
      */
    draw(ctx) { }
    /**
     * Remove the object from its scene/parent
     */
    kill() {
        if (this.parent !== null)
            this.parent.remove(this);
        if (this.scene !== null)
            this.scene.remove(this);
    }
    /**
     * Postpone the drawing of the object to after its children drawing
     */
    drawAfterChildren() { this.#drawBeforeChild = false; }
    /**
     * Return the world position of this object, thus taking into account all parent object
     *
     * @returns {Vector}
     */
    getWorldPosition(defaultPosition = new Vector()) {
        let currentObject = this;
        let currentPosition = defaultPosition;
        while (currentObject) {
            if (!currentObject.transform.scale.equalS(1, 1))
                currentPosition.mult(currentObject.transform.scale);
            if (currentObject.transform.rotation)
                currentPosition.rotate(currentObject.transform.rotation);
            if (!currentObject.transform.translation.nil())
                currentPosition.add(currentObject.transform.translation);
            currentObject = currentObject.parent;
        }
        return currentPosition;
    }
    /**
     * Return the world rotation of this object, thus taking into account all parent object
     *
     * @returns {number}
     */
    getWorldRotation() {
        let currentObject = this;
        let rotation = 0;
        while (currentObject) {
            rotation += currentObject.transform.rotation;
            currentObject = currentObject.parent;
        }
        return ((rotation % PI2) + PI2) % PI2;
    }
    getWorldTransformMatrix() {
        let matrix = this.transform.getMatrix();
        let currentObject = this.parent;
        while (currentObject) {
            matrix = TransformMatrix.multMat(currentObject.transform.getMatrix(), matrix);
            currentObject = currentObject.parent;
        }
        return matrix;
    }
}
