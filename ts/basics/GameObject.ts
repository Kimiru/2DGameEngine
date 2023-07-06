import { Transform } from "../math/Transform.js"
import { matrix, TransformMatrix } from "../math/TransformMatrix.js"
import { Vector } from "../math/Vector.js"
import { GameScene, RenderingType } from "./GameScene.js"
import { id } from "./Utils.js"

const PI2 = Math.PI * 2

/**
 * The GameObject class is the base brick class of the system, inhert from it to create any comonent of your system
 * Use the tags to retrieve groups of it from the scene perspective, children or not.
 */
export class GameObject {

    id: number = id()
    children: GameObject[] = []
    tags: string[] = ['$']
    updateEnabled: boolean = true
    childrenUpdateEnabled: boolean = true
    physicsEnabled: boolean = true
    childrenPhysicsEnabled: boolean = true
    drawEnabled: boolean = true
    childrenDrawEnabled: boolean = true
    parent: GameObject | null = null
    #scene: GameScene | null = null

    transform: Transform = new Transform()
    zIndex: number = 0

    drawRange: number = 0 // If set to infinity, will always be rendered no matter the rendering style
    renderingType: RenderingType = RenderingType.INFINITY

    /**
     * Create a new raw GameObject
     */
    constructor() {

    }

    /**
     * If the object or any parent object is in the scene, returns it
     */
    get scene(): GameScene | null { return this.#scene ?? this.parent?.scene ?? null }

    /**
     * Set the scene of the object
     * Used by GameScene
     */
    set scene(scene: GameScene | null) { this.#scene = scene }

    /**
     * @returns {GameEngine}
     */
    get engine() { return this.scene?.engine ?? null }

    /**
     * @returns {Input}
     */
    get input() { return this.engine?.input ?? null }

    /**
     * Return true if object is either in a scene or has a parent object
     */
    get used() { return this.scene !== null || this.parent !== null }

    get position(): Vector { return this.transform.translation }
    get rotation(): number { return this.transform.rotation }
    set rotation(rotation: number) { this.transform.rotation = rotation }
    get size(): Vector { return this.transform.scale }

    /**
     * Adds one or more tag to the object
     * 
     * @param {...string} tag 
     */
    addTag(...tag: string[]) {

        this.tags.push(...tag)

    }

    /**
     * Removes one or more tag from the object
     * 
     * @param {...string} tag 
     */
    removeTag(...tag: string[]) {


        for (let t of tag) {

            let index = this.tags.indexOf(t)

            if (index !== -1)
                this.tags.splice(index, 1)

        }

    }

    /**
     * Add the given object to this object children
     * 
     * @param {...GameObject} object 
     * @returns {this}
     */
    add(...object: GameObject[]): this {

        for (let obj of object) if (obj instanceof GameObject) {

            if (obj instanceof GameComponent && obj.unique && this.getComponent(obj.componentTag)) throw `Cannot add more than one unique component of type "${obj.componentTag}"`

            if (obj.used)
                obj.kill()

            obj.parent = this
            this.children.push(obj)
            this.scene?.addTags(obj)

            obj.onAdd()

        }

        return this
    }

    /**
     * Remove the given objects from this object children
     * 
     * @param {...GameObject} object 
     * @returns {this}
     */
    remove(...object: GameObject[]): this {

        for (let obj of object) if (obj instanceof GameObject) {

            let index = this.children.indexOf(obj)

            if (index !== -1) {

                this.scene?.removeTags(obj)
                obj.parent = null
                this.children.splice(index, 1)

                obj.onRemove()

            }

        }

        return this

    }

    /**
     * Is called when the object is added to a scene or another object
     * Is to be modified by the user
     * Should not be called by the user
     */
    onAdd(): void { }

    /**
     * Is called when the object is removed from a scene or a parent object
     * Is to be modified by the user
     * Should not be called by the user
     */
    onRemove(): void { }

    getComponent<T extends GameComponent>(componentTag: string): T | null {

        return this.children.find(
            child =>
                child.tags.includes('component') &&
                child.tags.includes(componentTag)
        ) as T ?? null

    }

    getComponents<T extends GameComponent>(componentTag: string): T[] {

        return this.children.filter(
            child =>
                child.tags.includes('component') &&
                child.tags.includes(componentTag)
        ) as T[]

    }

    doIf(predicate: () => boolean) {

        this.updateIf(predicate)
        this.physicsIf(predicate)
        this.drawIf(predicate)

    }

    #updatePredicate: (() => boolean)[] = []
    updateIf(predicate: () => boolean) {

        this.#updatePredicate.push(predicate)

    }

    /**
    * Update the object and its child.
    * Is called by the Scene or parent objects to update this object.
    * Should not be called by the user.
    * 
    * @param {number} dt 
    */
    executeUpdate(dt: number) {

        if (this.#updatePredicate.length && !this.#updatePredicate.every(predicate => predicate())) return

        if (this.updateEnabled) this.update(dt)

        if (this.childrenUpdateEnabled)
            for (let child of [...this.children])
                if (child instanceof GameObject)
                    child.executeUpdate(dt)

        if (this.updateEnabled) this.postUpdate(dt)

    }

    #physicsPredicate: (() => boolean)[] = []
    physicsIf(predicate: () => boolean) {

        this.#physicsPredicate.push(predicate)

    }

    executePhysics(dt: number) {

        if (this.#physicsPredicate.length && !this.#physicsPredicate.every(predicate => predicate())) return

        if (this.physicsEnabled) this.physics(dt)

        if (this.childrenPhysicsEnabled)
            for (let child of [...this.children])
                if (child instanceof GameObject)
                    child.executePhysics(dt)

        if (this.physicsEnabled) this.postPhysics(dt)

    }

    childrenDrawFilter(children: GameObject[]): GameObject[] { return children }

    #drawPredicate: (() => boolean)[] = []
    drawIf(predicate: () => boolean) {

        this.#drawPredicate.push(predicate)

    }

    /**
    * Draw the object and its child.
    * Is called by the Scene or parent objects to draw this object.
    * Should not be called by the user.
    * 
    * @param {number} dt 
    */
    executeDraw(ctx: CanvasRenderingContext2D, drawRange: number = 0, cameraPosition: Vector = new Vector()) {

        if (this.#drawPredicate.length && !this.#drawPredicate.every(predicate => predicate())) return

        ctx.save()

        ctx.transform(...this.transform.getMatrix())

        if (this.drawEnabled) this.draw(ctx)

        if (this.childrenDrawEnabled) {

            let children = this.childrenDrawFilter(this.children).sort((a, b) => a.zIndex != b.zIndex ? a.zIndex - b.zIndex : b.transform.translation.y - a.transform.translation.y)

            if (this.renderingType === RenderingType.INFINITY) {

                for (let child of children)
                    if (child instanceof GameObject)
                        child.executeDraw(ctx, drawRange, cameraPosition)

            }

            else if (this.renderingType === RenderingType.IN_VIEW) {

                for (let child of children) {

                    let childPosition = child.getWorldPosition()
                    let distance = cameraPosition.distanceTo(childPosition)
                    let maxChildRange = distance - drawRange

                    if (child.drawRange >= maxChildRange && child instanceof GameObject)
                        child.executeDraw(ctx, drawRange, cameraPosition)
                }

            }

        }

        if (this.drawEnabled) this.postDraw(ctx)

        ctx.restore()

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
    update(dt: number): void { }

    postUpdate(dt: number): void { }

    /**
     * Update the physics of the object
     * 
     * Is called when the object physics is updated
     * Is to be modified by the user
     * Should not be called by the user
     * 
     * @param {number} dt 
     */

    physics(dt: number): void { }

    postPhysics(dt: number): void { }

    /**
      * Draw the object specific element
      * 
      * Is called when the object is drawn
      * Is to be modified by the user
      * Should not be called by the user
      * 
      * @param {CanvasRenderingContext2D} ctx 
      */
    draw(ctx: CanvasRenderingContext2D): void { }

    postDraw(ctx: CanvasRenderingContext2D): void { }

    /**
     * Remove the object from its scene/parent
     */
    kill(): void {

        if (this.parent !== null)
            this.parent.remove(this)

        if (this.scene !== null)
            this.scene.remove(this)

    }

    /**
     * Return the world position of this object, thus taking into account all parent object
     * 
     * @returns {Vector}
     */
    getWorldPosition(defaultPosition: Vector = new Vector()): Vector {

        let currentObject: GameObject | null = this
        let currentPosition = defaultPosition

        while (currentObject) {

            if (!currentObject.transform.scale.equalS(1, 1))
                currentPosition.mult(currentObject.transform.scale)

            if (currentObject.transform.rotation)
                currentPosition.rotate(currentObject.transform.rotation)

            if (!currentObject.transform.translation.nil())
                currentPosition.add(currentObject.transform.translation)


            currentObject = currentObject.parent

        }

        return currentPosition

    }

    /**
     * Return the world rotation of this object, thus taking into account all parent object
     * 
     * @returns {number}
     */
    getWorldRotation(): number {

        let currentObject: GameObject | null = this
        let rotation = 0

        while (currentObject) {

            rotation += currentObject.transform.rotation

            currentObject = currentObject.parent

        }

        return ((rotation % PI2) + PI2) % PI2

    }

    getWorldTransformMatrix(): matrix {

        let matrix: matrix = this.transform.getMatrix()

        let currentObject: GameObject | null = this.parent

        while (currentObject) {

            matrix = TransformMatrix.multMat(currentObject.transform.getMatrix(), matrix)
            currentObject = currentObject.parent

        }

        return matrix

    }

}

export class GameComponent extends GameObject {

    unique: boolean = false
    componentTag: string

    constructor(componentTag: string) {

        super()

        this.addTag('component')
        this.addTag(componentTag)

        this.componentTag = componentTag

    }

}