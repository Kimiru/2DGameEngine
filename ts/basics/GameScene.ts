import { Camera } from "../camera/Camera.js"
import { Vector } from "../math/Vector.js"
import { GameEngine } from "./GameEngine.js"
import { GameObject } from "./GameObject.js"

export enum RenderingType {

    INFINITY,  // DEFAULT // Render all object no matter the distance // No extra computation // Recommended with small amount of object
    // static IN_VIEW = 1 // Render only the object that are in the cameraview, or at default position and range if no camera is set // Distance to camera computation for all object // Recommended when lot of object with little child depth
    IN_VIEW  // Render only the object for which the root object is in camera range // Distance to camera computation for root object only // Recommended when lots of object with lots of child depth

}

/**
 * GameScene is the class responsible for all the scene related operation such as camera definition, object adding, object grouping, scene update and rendering.
 * GameScene id is not used for scene unicity but for scene sorting regarding Network.
 * If you need multiple instance of the same scene, make sure ids are different but deterministic.
 * The deteministic side is needed when working with the Network
 * It is recommended to instanciate all your scene at the beginning if possible
 */
export class GameScene {

    static list: Map<string, GameScene> = new Map()

    id: string = 'GameScene'

    tags: Map<string, GameObject[]> = new Map()

    children: GameObject[] = []
    camera: Camera | null = null
    engine: GameEngine | null = null
    parentScene: GameScene | null = null

    renderingType: RenderingType = RenderingType.INFINITY

    /**
     * Create a new empty GameScene
     */
    constructor(parentScene: GameScene | null = null) {

        this.parentScene = parentScene

    }

    store(): void { GameScene.list.set(this.id, this) }

    exit(): void {

        if (!this.engine) return

        this.engine.setScene(this.parentScene)

    }

    /**
     * Execute the scene update when not in use by an engine. 
     * Still requires an engine as a reference point.
     */
    executeBlindUpdate(engine: GameEngine, dt: number): void {

        if (this.engine) return

        this.engine = engine

        this.executeUpdate(dt)

        this.engine = null

    }

    /**
     * Execute the scene physics when not in use by an engine.
     * Still requires an engine as a reference point.
     */
    executeBlindPhysics(engine: GameEngine, dt: number): void {

        if (this.engine) return

        this.engine = engine

        this.executePhysics(dt)

        this.engine = null

    }

    /**
     * Update the scene and its child
     * Is called by the GameEngine to update the scene
     * Should not be called by the user
     * 
     * @param {number} dt 
     */
    executeUpdate(dt: number) {

        this.update(dt)

        for (let child of [...this.children])
            if (child instanceof GameObject)
                child.executeUpdate(dt)

        this.postUpdate(dt)

    }

    executePhysics(dt: number) {

        this.physics(dt)

        for (let child of [...this.children])
            if (child instanceof GameObject)
                child.executePhysics(dt)

        this.postPhysics(dt)

    }

    childrenDrawFilter(children: GameObject[]): GameObject[] { return children }

    getDrawRange(): number {

        let drawRange = new Vector(this.engine!.usableWidth, this.engine!.usableHeight).length() / 2

        if (this.camera)
            drawRange *= this.camera.getRange()

        return drawRange

    }

    getCameraPosition(): Vector {

        return this.camera?.getWorldPosition() ?? new Vector(0, 0)

    }

    /**
     * Draw the scene and its children (children first)
     * Is called by the GameEngine to draw the scene
     * Should not be called by the user
     * 
     * @param ctx 
     */
    executeDraw(ctx: CanvasRenderingContext2D) {

        let drawRange = this.getDrawRange()
        let cameraPosition = this.getCameraPosition()

        if (this.camera) {
            ctx.transform(...this.camera.getViewTransformMatrix())
        }

        this.draw(ctx)

        let children = this.childrenDrawFilter(this.children).sort((a, b) => a.zIndex != b.zIndex ? a.zIndex - b.zIndex : b.transform.translation.y - a.transform.translation.y)

        if (this.renderingType === RenderingType.INFINITY) {

            for (let child of children)
                if (child instanceof GameObject) child.executeDraw(ctx, drawRange, cameraPosition)
        }

        else if (this.renderingType === RenderingType.IN_VIEW) {

            for (let child of children) {

                let childPosition = child.getWorldPosition()
                let distance = cameraPosition.distanceTo(childPosition)
                let maxChildRange = distance - drawRange

                if (child.drawRange >= maxChildRange && child instanceof GameObject) child.executeDraw(ctx, drawRange, cameraPosition)

            }

        }

        this.postDraw(ctx)

    }

    /**
     * Add one or more object to the scene sorting them out by their tages, removing them from previous parent/scene if needed
     * 
     * @param {...GameObject} object 
     * @returns {this}
     */
    add(...object: GameObject[]): this {

        for (let obj of object) if (obj instanceof GameObject) {

            if (obj.used)
                obj.kill()

            obj.scene = this
            this.children.push(obj)

            this.addTags(obj)

            obj.onAdd()

        }
        return this
    }

    /**
     * Sort the given objects and their children by their tags
     * Should not be called by the user
     * 
     * @param {...GameObject} object 
     * @returns {this}
     */
    addTags(...object: GameObject[]): this {

        for (let obj of object) if (obj instanceof GameObject) {

            for (let tag of obj.tags) {

                if (!this.tags.has(tag)) this.tags.set(tag, [])

                this.tags.get(tag)!.push(obj)

            }

            this.addTags(...obj.children)

        }

        return this

    }

    /**
     * Remove one or more from the scene, object should be in the scene
     * 
     * @param {...GameObject} object 
     * @returns {this}
     */
    remove(...object: GameObject[]): this {

        for (let obj of object) if (obj instanceof GameObject) {

            let index = this.children.indexOf(obj)

            if (index !== -1) {

                this.removeTags(obj)

                obj.scene = null
                this.children.splice(index, 1)

                obj.onRemove()

            }

        }

        return this

    }

    /**
     * Remove the given objects and their children from the tag sorting lists
     * Should not be called by the user
     * 
     * @param {...GameObject} object 
     * @returns {this}
     */
    removeTags(...object: GameObject[]): this {

        for (let obj of object) if (obj instanceof GameObject) {

            for (let tag of obj.tags) {

                let list = this.tags.get(tag)!

                let index = list.indexOf(obj)

                if (index !== -1)
                    list.splice(index, 1)

            }

            this.removeTags(...obj.children)

        }

        return this

    }

    /**
     * Get an immutable array of all the object using the given tag
     * 
     * @param {string} tag 
     * @returns {GameObject[]}
     */
    getTags(tag: string): GameObject[] {

        return [...(this.tags.get(tag) ?? [])]

    }

    /**
     * Is called when the scene is set to a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onSet(): void {

    }

    /**
     * Is called when the scene is unset from a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onUnSet(): void {

    }

    /**
     * Is called when the canvas viewport changes when used by a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     * 
     * @param {number} width 
     * @param {number} height 
     */
    onResize(width: number, height: number): void {

    }

    /**
     * Update the scene specific operation
     * 
     * Is called when the scene is updated
     * Is to be modified by the user
     * Should not be called by the user
     * 
     * @param {number} dt 
     */
    update(dt: number): void { }

    postUpdate(dt: number): void { }

    /**
     * Update the scene physics specific operation
     * 
     * Is called when the scene physics is updated
     * Is to be modified by the user
     * Should not be called by the user
     * 
     * @param {number} dt 
     */
    physics(dt: number): void { }

    postPhysics(dt: number): void { }

    /**
     * Draw the scene specific element
     * 
     * Is called when the scene is drawn
     * Is to be modified by the user
     * Should not be called by the user
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx: CanvasRenderingContext2D): void { }

    postDraw(ctx: CanvasRenderingContext2D): void { }

}