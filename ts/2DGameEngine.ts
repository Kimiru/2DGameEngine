declare global {
    interface Window {
        Peer: any
    }
}

type matrix = [number, number, number, number, number, number]

const PI2 = Math.PI * 2

const gameEngineConstructorArguments: {
    width: number,
    height: number,
    verticalPixels: number,
    scaling: number,
    images: { name: string, src: string }[],
    sounds: { name: string, srcs: string[] }[]
} = {
    width: innerWidth,
    height: innerHeight,
    verticalPixels: 100,
    scaling: 2,
    images: [],
    sounds: []
}

/**
 * GameEngine is the class responsible for the execution of the game loop, the canvas and resize change, and the scene management
 */
export class GameEngine {

    canvas: HTMLCanvasElement = document.createElement('canvas')
    ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')
    input: Input = new Input()

    #width: number = 0
    #height: number = 0
    #trueWidth: number = 0
    #trueHeight: number = 0
    #verticalPixels: number = 1
    #ratio: number = 1
    #scaling: number = 1
    #usableWidth: number = 0
    #usableHeight: number = 0

    #run: boolean = false
    #lastTime: number = Date.now()
    #dt: number = 0
    #currentScene: GameScene = null
    #nextScene: GameScene = undefined
    imageBank: Map<string, HTMLImageElement> = new Map()
    soundBank: Map<string, Sound> = new Map()
    #lock0: boolean = true
    #lock1: boolean = true
    #lock2: boolean = true
    #loadedImagesCount: number = 0
    #imageToLoadCount: number = 0
    #loadedSoundCount: number = 0
    #soundToLoadCount: number = 0
    #ressourcesLoadedCallbacks: (() => void)[] = []

    /**
     * Create a new game engine using the given argument list, filling the gap with default value
     * 
     * @param {width: number, height: number, verticalPixels: number, scaling: number, images: Image[]} args 
     */
    constructor(args = gameEngineConstructorArguments) {

        args = { ...gameEngineConstructorArguments, ...args }

        this.input.bindMouse(this.canvas, (vector: Vector) => {

            let sc = this.usableScale
            let half = this.usableScale.clone().divS(2)
            vector.mult(sc).sub(half)
            vector.y *= -1

            if (this.#currentScene && this.#currentScene.camera) {

                let matrix = this.#currentScene.camera.getWorldTransformMatrix()
                vector = TransformMatrix.multVec(matrix, vector)

            }

            return vector

        })
        this.canvas.style.position = 'relative'
        this.canvas.style.backgroundColor = 'black'

        this.resize(args.width, args.height, args.scaling, args.verticalPixels)
        this.#imageToLoadCount = args.images.length
        this.#soundToLoadCount = args.sounds.map(e => e.srcs.length).reduce((a, b) => a + b, 0)
        this.imageBank = loadImages(
            args.images,
            (n: number) => { this.#loadedImagesCount = n },
            () => {

                this.#lock1 = false

                if (!this.#lock1 && !this.#lock2) {

                    this.#lock0 = false

                    this.#ressourcesLoadedCallbacks.forEach(func => func.call(this))

                }

            }
        )

        this.soundBank = loadSounds(
            args.sounds,
            (n: number) => { this.#loadedSoundCount = n },
            () => {

                this.#lock2 = false

                if (!this.#lock1 && !this.#lock2) {

                    this.#lock0 = false

                    this.#ressourcesLoadedCallbacks.forEach(func => func.call(this))

                }
            }
        )

    }


    get trueWidth(): number { return this.#trueWidth }
    get trueHeight(): number { return this.#trueHeight }
    get usableWidth(): number { return this.#usableWidth }
    get usableHeight(): number { return this.#usableHeight }
    get usableScale(): Vector { return new Vector(this.usableWidth, this.usableHeight) }

    get dt(): number { return this.#dt }

    get scene(): GameScene { return this.#currentScene }

    /**
     * update the size of both canvas
     * if a scene is curently used, update it's camera
     * 
     * @param {number} width 
     * @param {number} height 
     */
    resize(width: number, height: number, scaling: number = this.#scaling, pixels: number = this.#verticalPixels): void {

        this.#width = width
        this.#height = height
        this.#scaling = scaling

        this.#trueWidth = width * scaling
        this.#trueHeight = height * scaling

        this.canvas.width = width * scaling
        this.canvas.height = height * scaling
        this.ctx.imageSmoothingEnabled = false
        this.canvas.style.width = width + 'px'
        this.canvas.style.height = height + 'px'

        this.setVerticalPixels(pixels)

        if (this.#currentScene) {

            this.#currentScene.onResize(width, height)

        }


    }

    /**
     * Set the number vertical virtual pixel.
     * i.e. if a 1x1 square is drawn, it will take 1/pixels the space
     * 
     * @param {number} pixels 
     */
    setVerticalPixels(pixels: number = 1): void {

        this.#verticalPixels = pixels

        this.#ratio = this.#trueHeight / this.#verticalPixels

        this.#usableHeight = this.#verticalPixels
        this.#usableWidth = this.#trueWidth / this.#ratio

    }

    /**
     * Set the new scene to be displayed, can be null
     * 
     * @param {GameScene | null} scene 
     */
    setScene(scene: GameScene): void {

        this.#nextScene = scene

    }

    /**
     * Effectively switch the scene to be displayed
     * Is called at then end of the gameloop
     */
    #switchScene(): void {

        if (this.#nextScene !== undefined) {

            if (this.#currentScene) {

                this.#currentScene.onUnSet()
                this.#currentScene.engine = null

            }

            this.#currentScene = this.#nextScene
            this.#nextScene = undefined

            this.resize(this.#width, this.#height, this.#scaling)

            if (this.#currentScene) {

                this.#currentScene.onSet()
                this.#currentScene.engine = this

            }

        }

    }

    /**
     * Start the engine, running the gameloop
     */
    start(): void {

        this.#run = true
        this.#loop()

    }

    /**
     * Stop the engine, stopping the gameloop
     */
    stop(): void {

        this.#run = false

    }

    /**
     * Execute the gameloop
     * 
     * update -> draw -> repeat
     * 
     * inputs are obtained using javascript event catcher
     * 
     */
    #loop(): void {

        if (!this.#run) return;

        if (this.#lock0) {

            let value = this.#loadedImagesCount + this.#loadedSoundCount
            let tot = this.#imageToLoadCount + this.#soundToLoadCount

            this.ctx.clearRect(0, 0, this.#trueWidth, this.trueHeight)

            this.ctx.save()

            this.ctx.fillStyle = 'red'
            this.ctx.fillRect(0.1 * this.trueWidth, 0.45 * this.trueHeight, 0.8 * this.trueWidth * (value / tot), 0.1 * this.trueHeight)

            this.ctx.restore()

            requestAnimationFrame(this.#loop.bind(this))

            return

        }

        let time: number = Date.now();
        this.#dt = (time - this.#lastTime) / 1000;
        this.#lastTime = time;
        this.#dt = Math.min(this.#dt, 0.2)
        this.ctx.clearRect(0, 0, this.#trueWidth, this.trueHeight)
        this.ctx.save()
        this.ctx.translate(this.trueWidth / 2, this.trueHeight / 2)
        this.ctx.scale(this.#ratio, -this.#ratio)

        if (this.#currentScene) {

            this.#currentScene.executeUpdate(this.#dt)
            this.#currentScene.executePhysics(this.#dt)
            this.#currentScene.executeDraw(this.ctx)

            if (window.Peer)
                if (NetworkGameObject.hasPendingUpdates())
                    NetworkGameObject.flushPendingUpdates()

        }

        this.ctx.restore()

        this.input.mouseLoop()

        this.#switchScene()

        requestAnimationFrame(this.#loop.bind(this));

    }

    onResourcesLoaded(callback) {
        if (this.#lock0) {

            this.#ressourcesLoadedCallbacks.push(callback)

        } else callback.call(this)
    }

}

export class RenderingStyle {

    static INFINITY = 0 // DEFAULT // Render all object no matter the distance // No extra computation // Recommended with small amount of object
    // static IN_VIEW = 1 // Render only the object that are in the cameraview, or at default position and range if no camera is set // Distance to camera computation for all object // Recommended when lot of object with little child depth
    static IN_VIEW = 1 // Render only the object for which the root object is in camera range // Distance to camera computation for root object only // Recommended when lots of object with lots of child depth

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
    camera: Camera = null
    engine: GameEngine = null

    renderingStyle: number = RenderingStyle.INFINITY

    /**
     * Create a new empty GameScene
     */
    constructor() {

    }

    store(): void { GameScene.list.set(this.id, this) }

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

    }

    executePhysics(dt: number) {

        this.physics(dt)

        for (let child of [...this.children])
            if (child instanceof GameObject)
                child.executePhysics(dt)

    }

    childrenDrawFilter(children: GameObject[]): GameObject[] { return children }

    /**
     * Draw the scene and its children (children first)
     * Is called by the GameEngine to draw the scene
     * Should not be called by the user
     * 
     * @param ctx 
     */
    executeDraw(ctx: CanvasRenderingContext2D) {

        let drawRange = new Vector(this.engine.usableWidth, this.engine.usableHeight).length() / 2
        let cameraPosition = this.camera?.getWorldPosition() ?? new Vector(0, 0)

        if (this.camera) {
            ctx.transform(...this.camera.getViewTransformMatrix())
            drawRange *= this.camera.getRange()
        }

        let children = this.childrenDrawFilter(this.children).sort((a, b) => a.zIndex != b.zIndex ? a.zIndex - b.zIndex : b.transform.translation.y - a.transform.translation.y)

        if (this.renderingStyle === RenderingStyle.INFINITY) {

            for (let child of children)
                if (child instanceof GameObject) child.executeDraw(ctx, drawRange, cameraPosition)
        }

        else if (this.renderingStyle === RenderingStyle.IN_VIEW) {

            for (let child of children) {

                let childPosition = child.getWorldPosition()
                let distance = cameraPosition.distanceTo(childPosition)
                let maxChildRange = distance - drawRange

                if (child.drawRange >= maxChildRange && child instanceof GameObject) child.executeDraw(ctx, drawRange, cameraPosition)

            }

        }



        this.draw(ctx)

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

                this.tags.get(tag).push(obj)

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

                let list = this.tags.get(tag)

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

}


export class Transform {

    translation: Vector = new Vector()
    #rotation: number = 0
    scale: Vector = new Vector()

    constructor(translation: Vector = new Vector(0, 0, 0), rotation: number = 0, scale: Vector = new Vector(1, 1, 1)) {

        this.translation.copy(translation)
        this.rotation = rotation
        this.scale.copy(scale)

    }

    /**
    * Return the rotation of the object
    * 
    * @returns {number}
    */
    get rotation() { return this.#rotation }

    /**
     * Set the rotation of the object
     * The angle is automatically converted into modulo 2.PI > 0
     * 
     * @param {number} angle
     */
    set rotation(angle: number) {

        this.#rotation = ((angle % PI2) + PI2) % PI2

    }

    clear() {

        this.translation.set(0, 0, 0)
        this.rotation = 0
        this.scale.set(1, 1, 1)

    }

    isDefault(): boolean {

        return this.translation.x === 0 && this.translation.y === 0 &&
            this.#rotation == 0 &&
            this.scale.x === 1 && this.scale.y === 1

    }

    getMatrix(): matrix {

        let cos = Math.cos(this.#rotation)
        let sin = Math.sin(this.#rotation)
        let sx = this.scale.x
        let sy = this.scale.y
        let x = this.translation.x
        let y = this.translation.y

        return [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ]

    }

    getInvertMatrix(): matrix {

        let cos = Math.cos(-this.#rotation)
        let sin = Math.sin(-this.#rotation)
        let sx = 1 / this.scale.x
        let sy = 1 / this.scale.y
        let x = -this.translation.x * cos * sx + -this.translation.x * -sin * sx
        let y = -this.translation.y * sin * sy + -this.translation.y * cos * sy

        return [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ]

    }

    toString() {

        let str = 'Transform( '

        if (this.translation.x !== 0 || this.translation.y !== 0) str += this.translation.toString() + ' '
        if (this.rotation !== 0) str += this.rotation + ' '
        if (this.scale.x !== 1 || this.scale.y !== 1) str += this.scale.toString() + ' '

        str += ')'

        return str

    }

}

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
    nbvc = new Map()
    parent: GameObject = null
    #scene: GameScene = null
    #drawBeforeChild: boolean = true

    transform: Transform = new Transform()
    zIndex: number = 0

    drawRange: number = 0 // If set to infinity, will always be rendered no matter the rendering style
    renderingStyle: number = RenderingStyle.INFINITY

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
    get scene(): GameScene { return this.#scene ?? this.parent?.scene ?? null }

    /**
     * Set the scene of the object
     * Used by GameScene
     * 
     * @param {GameScene} scene
     */
    set scene(scene: GameScene) { this.#scene = scene }

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

    /**
    * Update the object and its child.
    * Is called by the Scene or parent objects to update this object.
    * Should not be called by the user.
    * 
    * @param {number} dt 
    */
    executeUpdate(dt: number) {

        if (this.updateEnabled) this.update(dt)

        if (this.childrenUpdateEnabled)
            for (let child of [...this.children])
                if (child instanceof GameObject)
                    child.executeUpdate(dt)

    }

    executePhysics(dt: number) {

        if (this.physicsEnabled) this.physics(dt)

        if (this.childrenPhysicsEnabled)
            for (let child of [...this.children])
                if (child instanceof GameObject)
                    child.executePhysics(dt)

    }

    childrenDrawFilter(children: GameObject[]): GameObject[] { return children }

    /**
    * Draw the object and its child.
    * Is called by the Scene or parent objects to draw this object.
    * Should not be called by the user.
    * 
    * @param {number} dt 
    */
    executeDraw(ctx: CanvasRenderingContext2D, drawRange: number, cameraPosition: Vector) {

        ctx.save()

        ctx.transform(...this.transform.getMatrix())

        if (this.#drawBeforeChild && this.drawEnabled) this.draw(ctx)

        if (this.childrenDrawEnabled) {

            let children = this.childrenDrawFilter(this.children).sort((a, b) => a.zIndex != b.zIndex ? a.zIndex - b.zIndex : b.transform.translation.y - a.transform.translation.y)

            if (this.renderingStyle === RenderingStyle.INFINITY) {

                for (let child of children)
                    if (child instanceof GameObject)
                        child.executeDraw(ctx, drawRange, cameraPosition)

            }

            else if (this.renderingStyle === RenderingStyle.IN_VIEW) {

                for (let child of children) {

                    let childPosition = child.getWorldPosition()
                    let distance = cameraPosition.distanceTo(childPosition)
                    let maxChildRange = distance - drawRange

                    if (child.drawRange >= maxChildRange && child instanceof GameObject)
                        child.executeDraw(ctx, drawRange, cameraPosition)
                }

            }

        }

        if (!this.#drawBeforeChild && this.drawEnabled) this.draw(ctx)

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
     * Postpone the drawing of the object to after its children drawing
     */
    drawAfterChildren(): void { this.#drawBeforeChild = false }

    /**
     * Return the world position of this object, thus taking into account all parent object
     * 
     * @returns {Vector}
     */
    getWorldPosition(defaultPosition: Vector = new Vector()): Vector {

        let currentObject: GameObject = this
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

        let currentObject: GameObject = this
        let rotation = 0

        while (currentObject) {

            rotation += currentObject.transform.rotation

            currentObject = currentObject.parent

        }

        return ((rotation % PI2) + PI2) % PI2

    }

    getWorldTransformMatrix(): matrix {

        let matrix: matrix = this.transform.getMatrix()

        let currentObject: GameObject = this.parent

        while (currentObject) {

            matrix = TransformMatrix.multMat(currentObject.transform.getMatrix(), matrix)
            currentObject = currentObject.parent

        }

        return matrix

    }

}

/**
 * The Timer class is used to mesure time easily
 */
export class Timer {

    begin: number

    /**
     * Create a new timer starting from now or a given setpoint
     * 
     * @param time 
     */
    constructor(time = Date.now()) {

        this.begin = time;

    }

    /**
     * Reset the timer
     */
    reset(): void {

        this.begin = Date.now()

    }

    /**
     * Return the amount of time in ms since the timer was last reset
     */
    getTime(): number {

        return Date.now() - this.begin;

    }

    /**
     * Return true if the time since the last reset is greather that the given amount in ms
     * 
     * @param {number} amount in ms
     */
    greaterThan(amount: number): boolean {

        return this.getTime() > amount;

    }

    /**
     * Return true if the time since the last reset is less that the given amount in ms
     * 
     * @param {number} amount 
     */
    lessThan(amount: number): boolean {

        return this.getTime() < amount;

    }

}

/**
 * The Input class is used to register keyboard input, and mouse input if linked to an element
 */
export class Input {

    #charDown: Set<string> = new Set()
    #charOnce: Set<string> = new Set()
    #keysDown: Set<string> = new Set()
    #keysOnce: Set<string> = new Set()
    #mouseButtons: [boolean, boolean, boolean] = [false, false, false]
    #mousePosition: Vector = new Vector()
    #mouseIn: boolean = false
    #mouseClick: [boolean, boolean, boolean] = [false, false, false]
    positionAdapter = function (vector: Vector) { return vector }

    constructor() {

        window.addEventListener('keydown', (evt) => {

            this.#charDown.add(evt.key)
            this.#charOnce.add(evt.key)
            this.#keysDown.add(evt.code)
            this.#keysOnce.add(evt.code)

        })

        window.addEventListener('keyup', (evt) => {

            this.#keysDown.delete(evt.code)
            this.#keysOnce.delete(evt.code)

        })

    }

    /**
     * Returns an instant of the mouse, click field if true will be available for one frame only
     */
    get mouse(): {
        left: boolean
        middle: boolean
        right: boolean
        leftClick: boolean
        middleClick: boolean
        rightClick: boolean
        position: Vector
        in: boolean
    } {
        let result = {
            left: this.#mouseButtons[0],
            middle: this.#mouseButtons[1],
            right: this.#mouseButtons[2],
            leftClick: this.#mouseClick[0],
            middleClick: this.#mouseClick[1],
            rightClick: this.#mouseClick[2],
            position: this.#mousePosition.clone(),
            in: this.#mouseIn
        }

        return result
    }

    /**
     * Return true if the given char is down
     * 
     * @param {string} char 
     * @returns {boolean}
     */
    isCharDown(char: string): boolean { return this.#charDown.has(char) }

    /**
     * return true once if the given char is down, must be repressed to return true again
     * 
     * @param {string} code 
     * @returns {boolean}
     */
    isCharPressed(char: string): boolean {

        if (this.#charOnce.has(char)) {

            this.#charOnce.delete(char)

            return true

        }

        return false
    }

    /**
     * Return true if the given key is down
     * 
     * @param {string} code 
     * @returns {boolean}
     */
    isDown(code: string): boolean { return this.#keysDown.has(code) }

    /**
     * return true once if the given key is down, must be repressed to return true again
     * 
     * @param {string} code 
     * @returns {boolean}
     */
    isPressed(code: string): boolean {

        if (this.#keysOnce.has(code)) {

            this.#keysOnce.delete(code)

            return true

        }

        return false

    }

    /**
     * Bind the input object to an html element, a position adapter function can be passed to convert the 0 to 1 default output to a preferable unit
     * 
     * @param {HTMLElement} element 
     * @param {(vector:Vector)=>Vector} positionAdapter 
     */
    bindMouse(element: HTMLElement, positionAdapter = function (vector: Vector) { return vector }) {

        this.positionAdapter = positionAdapter

        element.addEventListener('contextmenu', evt => evt.preventDefault());

        element.addEventListener('mousedown', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseup', this.#handleMouseEvent.bind(this))
        element.addEventListener('mousemove', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseleave', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseenter', this.#handleMouseEvent.bind(this))

    }

    mouseLoop() {

        for (let index = 0; index < 3; index++)
            this.#mouseClick[index] = false

    }

    /**
     * Handle the mouse related operations
     * 
     * @param {MouseEvent} evt 
     */
    #handleMouseEvent(evt: MouseEvent): void {

        let prev: [boolean, boolean, boolean] = [this.#mouseButtons[0], this.#mouseButtons[1], this.#mouseButtons[2]]

        this.#handleButtons(evt.buttons)
        this.#mousePosition.copy(this.#to01(evt))
        this.#mouseIn = this.#mousePosition.x > 0 && this.#mousePosition.x < 1 &&
            this.#mousePosition.y > 0 && this.#mousePosition.y < 1


        for (let index = 0; index < 3; index++)
            if (!this.#mouseButtons[index] && prev[index])
                this.#mouseClick[index] = true

    }

    /**
     * Convert the buttons input number to the adapted button boolean
     * 
     * @param buttons 
     */
    #handleButtons(buttons: number): void {

        switch (buttons) {
            case 1:
            case 3:
            case 5:
            case 7:
                this.#mouseButtons[0] = true
                break
            default:
                this.#mouseButtons[0] = false
                break;
        }
        switch (buttons) {
            case 4:
            case 5:
            case 6:
            case 7:
                this.#mouseButtons[1] = true
                break
            default:
                this.#mouseButtons[1] = false
                break;
        }
        switch (buttons) {
            case 2:
            case 3:
            case 6:
            case 7:
                this.#mouseButtons[2] = true
                break
            default:
                this.#mouseButtons[2] = false
                break;
        }

    }

    /**
     * convert the position from the html element size to the 0-1 scale
     * 
     * @param evt 
     * @returns 
     */
    #to01(evt: MouseEvent): Vector {

        let result = new Vector(evt.offsetX, evt.offsetY)
        let target = evt.currentTarget as HTMLCanvasElement
        result.div(new Vector(target.offsetWidth, target.offsetHeight, 1))

        return this.positionAdapter(result)

    }

}

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

export class MouseCursor extends GameObject {

    constructor() {

        super()

    }

    update(dt: number): void {

        let mouse = this.scene.engine.input.mouse

        this.transform.translation.copy(mouse.position)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.fillStyle = 'red'

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -5)
        ctx.lineTo(4, -4)
        ctx.lineTo(0, 0)
        ctx.fill()

    }

}

/**
 * The Camera class is used to set the center of the view inside a scene
 */
export class Camera extends GameObject {

    /**
     * Create a new Camera object
     */
    constructor() {

        super()

        this.updateEnabled = false
        this.physicsEnabled = false
        this.drawEnabled = false

    }

    getViewTransformMatrix(): matrix {

        let wpos = this.getWorldPosition()
        let wrot = this.getWorldRotation()

        return new Transform(wpos, wrot, this.transform.scale).getInvertMatrix()

    }



    getRange(): number { return Math.max(this.transform.scale.x, this.transform.scale.y) }

}

export class TrackingCamera extends Camera {

    trackedObject: GameObject
    trackLag: number = 1
    minTrack: number = 1

    constructor() {

        super()

        this.updateEnabled = true

    }

    update(dt: number): void {

        if (this.trackedObject && this.scene === this.trackedObject.scene) {

            let cameraWorldPosition = this.getWorldPosition()
            let objectWorldPosition = this.trackedObject.getWorldPosition()

            if (cameraWorldPosition.equal(objectWorldPosition)) return

            let rawOffset = objectWorldPosition.clone().sub(cameraWorldPosition)
            let offset = rawOffset.clone().divS(this.trackLag)
            let len = offset.length()
            if (len < this.minTrack) offset.normalize().multS(this.minTrack)
            offset.multS(dt)

            if (offset.length() > cameraWorldPosition.distanceTo(objectWorldPosition))
                this.transform.translation.add(rawOffset)
            else
                this.transform.translation.add(offset)

        }

    }

}

/**
 * class Vector represent a 3 dimentional vector
 * it also contains function that are used in 2d context for practical purposes
 */
export class Vector {

    x: number = 0
    y: number = 0
    z: number = 0

    /**
     * Create a new 3D Vector
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x: number = 0, y: number = 0, z: number = 0) {

        this.x = x
        this.y = y
        this.z = z

    }

    /**
    * Set this vector values to the given values
    * 
    * @param {number} x 
    * @param {number} y 
    * @param {number} z
    * @returns {this}
    */
    set(x: number = 0, y: number = 0, z: number = 0): this {

        this.x = x
        this.y = y
        this.z = z

        return this

    }

    /**
     * Add the given vector to this vector
     * 
     * @param {Vector} vector 
     * @returns {this}
     */
    add(vector: Vector = new Vector()): this {

        this.x += vector.x
        this.y += vector.y
        this.z += vector.z

        return this

    }

    /**
     * Add the given numbers to this vector
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     * @returns {this}
     */
    addS(x: number = 0, y: number = 0, z: number = 0): this {

        this.x += x
        this.y += y
        this.z += z

        return this

    }

    /**
     * Sub the given vector to this vector
     * 
     * @param {Vector} vector 
     * @returns {this}
     */
    sub(vector: Vector = new Vector()): this {

        this.x -= vector.x
        this.y -= vector.y
        this.z -= vector.z

        return this

    }

    /**
    * Sub the given numbers to this vector
    * 
    * @param {number} x 
    * @param {number} y 
    * @param {number} z
    * @returns {this}
    */
    subS(x: number = 0, y: number = 0, z: number = 0) {

        this.x -= x
        this.y -= y
        this.z -= z

        return this

    }

    /**
     * Multiply each of this vector value by each of the given vector value
     * 
     * @param {Vector} vector 
     * @returns {this}
     */
    mult(vector: Vector): this {

        this.x *= vector.x
        this.y *= vector.y
        this.z *= vector.z

        return this

    }

    /**
     * Multiply this vector by a given value
     * 
     * @param {number} n 
     * @returns {this}
     */
    multS(n: number): this {

        this.x *= n
        this.y *= n
        this.z *= n

        return this

    }

    /**
    * Divide each of this vector value by each of the given vector value
    * 
    * @param {Vector} vector 
    * @returns {this}
    */
    div(vector: Vector): this {

        this.x /= vector.x
        this.y /= vector.y
        this.z /= vector.z

        return this

    }

    /**
     * Divide this vector by a given value
     * 
     * @param {number} n 
     * @returns {this} 
     */
    divS(n: number): this {

        this.x /= n
        this.y /= n
        this.z /= n

        return this

    }

    /**
     * Returns the result of the dot product between this vector and the given vector
     * 
     * @param {Vector} vector 
     * @returns {number}
     */
    dot(vector: Vector): number { return this.x * vector.x + this.y * vector.y + this.z * vector.z }

    /**
     * Returns the length of this vector
     * 
     * @returns {number}
     */
    length(): number { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) }

    /**
     * Returns true if the length of this vector is 0
     * 
     * @returns {boolean}
     */
    nil(): boolean { return this.x == 0 && this.y == 0 && this.z == 0 }

    /**
     * Normalizes this vector if it is not nil
     * 
     * @returns {this}
     */
    normalize(): this {

        if (!this.nil())
            this.divS(this.length())

        return this

    }

    /**
     * Rotates the current vector of a given angle on the x and y values
     * 
     * @param {number} angle 
     * @returns {this}
     */
    rotate(angle: number): this {

        let cos = Math.cos(angle)
        let sin = Math.sin(angle)

        let x = cos * this.x - sin * this.y
        let y = sin * this.x + cos * this.y

        this.x = x
        this.y = y

        return this

    }

    /**
     * Rotate the current vector of a given angle arround a given position on the x and y values
     * 
     * @param {Vector} position 
     * @param {number} angle 
     * @returns {this}
     */
    rotateAround(position: Vector, angle: number): this {

        this.sub(position)
        this.rotate(angle)
        this.add(position)

        return this

    }

    /**
     * Returns the angle between this vector and the given vector
     * 
     * @param vector 
     * @returns {number}
     */
    angleTo(vector: Vector): number { return Math.acos(this.dot(vector) / (this.length() * vector.length())) }

    /**
     * Returns the angle on this vector on plane x, y
     * 
     * @returns {number}
     */
    angle(): number {

        let vec = this.clone().normalize()
        return Math.acos(vec.x) * Math.sign(vec.y)

    }

    /**
     * Returns the distance from this Vector position to the given Vector position
     * 
     * @param {Vector} vector 
     * @returns {number}
     */
    distanceTo(vector: Vector): number { return this.clone().sub(vector).length() }

    /**
     * Copy the given vector values to this vector
     * 
     * @param {Vector} vector 
     */
    copy(vector: Vector): this {

        this.x = vector.x
        this.y = vector.y
        this.z = vector.z

        return this

    }

    /**
     * A new instance clone of this vector
     * 
     * @returns {Vector}
     */
    clone() { return new Vector(this.x, this.y, this.z) }

    /**
     * Returns true if this vector values are equal to the given vector values
     * 
     * @param {Vector} vector 
     * @returns {boolean}
     */
    equal(vector: Vector): boolean { return this.x == vector.x && this.y == vector.y && this.z == vector.z }

    /**
     * Returns true if this vector values are equal to the given values
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     * @returns {boolean}
     */
    equalS(x: number = 0, y: number = 0, z: number = 0): boolean { return this.x == x && this.y == y && this.z == z }

    /**
     * Converts this vector to a string
     * 
     * @returns {string}
     */
    toString() { return `Vector(${this.x}, ${this.y}, ${this.z})` }

    /**
     * Returns a new unit vector from the given angle
     * 
     * @param {number} angle 
     * @returns {Vector}
     */
    static fromAngle(angle: number): Vector { return new Vector(Math.cos(angle), Math.sin(angle)) }

    static distanceBetween(a: Vector, b: Vector) { return a.distanceTo(b) }

    exec(func: (vec: Vector) => void): this {

        func(this)

        return this

    }

    /**
     * 
     * @returns {this}
     */
    round(): this {

        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
        this.z = Math.round(this.z)

        return this

    }

    /**
     * 
     * @returns {this}
     */
    floor(): this {

        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)
        this.z = Math.floor(this.z)

        return this

    }

    abs() {

        this.x = Math.abs(this.x)
        this.y = Math.abs(this.y)
        this.z = Math.abs(this.z)

        return this

    }

}

export class PositionIntegrator {

    previousPosition: Vector = new Vector()
    previousVelocity: Vector = new Vector()
    previousAcceleration: Vector = new Vector()
    position: Vector = new Vector()
    velocity: Vector = new Vector()
    acceleration: Vector = new Vector()

    constructor() { }

    integrate(t: number) {

        let tt = t * t

        this.previousPosition.copy(this.position)
        this.previousVelocity.copy(this.velocity)
        this.previousAcceleration.copy(this.acceleration)
        this.position
            .add(this.velocity.clone().multS(t))
            .add(this.acceleration.clone().multS(tt * 1 / 2))

        this.velocity.add(this.acceleration.clone().multS(t))

    }

    positionHasChanged() { return !this.previousPosition.equal(this.position) }

    velocityHasChanged() { return !this.previousVelocity.equal(this.velocity) }

    accelerationHasChanged() { return !this.previousAcceleration.equal(this.acceleration) }

}

/**
 * loads multiple images and use callbacks for progression checks and at the end
 * 
 * @param {{ name: string, src: string }[]} images 
 * @param {(completed:number) => void} incrementCallback 
 * @param {() => void}finishedCallback 
 * @returns 
 */
export function loadImages(images: { name: string, src: string }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, HTMLImageElement> {

    let bank: Map<string, HTMLImageElement> = new Map()
    let completed: { n: number } = { n: 0 }

    for (let image of images) {

        let img = document.createElement('img')
        img.src = image.src

        img.onload = function () {

            completed.n++

            incrementCallback(completed.n)

            if (completed.n == images.length)
                finishedCallback()

        }

        img.onerror = function (err) {

            console.error(`Could not load image "${image.name}" for source "${image.src}"`)

            console.error(err)

            completed.n++

            incrementCallback(completed.n)

            if (completed.n == images.length)
                finishedCallback()

        }

        bank.set(image.name, img)

    }

    if (images.length === 0)
        finishedCallback()

    return bank
}

class Sound {

    sounds: HTMLAudioElement[] = []
    volume: number = 1
    currentSound: HTMLAudioElement = null

    constructor(sounds: HTMLAudioElement[]) {

        this.sounds = sounds

    }

    play(): void {

        let sound = this.sounds[Math.floor(Math.random() * this.sounds.length)]
        sound.volume = this.volume

        if (this.currentSound)
            this.currentSound.pause()

        this.currentSound = sound
        this.currentSound.currentTime = 0
        this.currentSound.play()

    }

    setVolume(volume: number) { this.volume = volume }

}

export function loadSounds(sounds: { name: string, srcs: string[] }[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, Sound> {

    let bank: Map<string, Sound> = new Map()
    let completed: { n: number } = { n: 0 }
    let toComplete: { n: number } = { n: 0 }

    for (let sound of sounds) {

        let snds = []

        for (let src of sound.srcs) {

            toComplete.n++

            let snd = document.createElement('audio')
            snd.src = src

            snd.oncanplay = function () {

                completed.n++

                incrementCallback(completed.n)

                if (completed.n == toComplete.n)
                    finishedCallback()

            }

            snd.onerror = function (err) {

                console.error(`Could not load sound "${sound.name}" for source "${src}"`)

                console.error(err)

                completed.n++

                incrementCallback(completed.n)

                if (completed.n == toComplete.n)
                    finishedCallback()

            }

            snds.push(snd)

        }

        bank.set(sound.name, new Sound(snds))

    }

    if (completed.n == toComplete.n)
        finishedCallback()

    return bank

}


/**
 * The Polygon represent a N point polygon
 * To work properly, it needs at least 3 point to close
 */
export class Polygon extends GameObject {

    #points: Vector[] = []

    outer: Vector[] = []
    inners: Vector[][] = []

    fill: boolean = false

    /**
     * Create a new polygon using the given points
     * 
     * @param points 
     */
    constructor(outer: Vector[] = [], ...inners: Vector[][]) {

        super()

        this.outer = outer
        this.inners = inners

    }

    /**
     * Returns a list of points, such that it represents the polygon with theorically no holes. Duplicates the first Vector at the end of the list for practical purposes
     * 
     * @returns {Vector[]}
     */
    getLinear(): Vector[] {

        let points: Vector[] = [...this.outer, this.outer[0]]

        for (let inner of this.inners)
            points.push(...inner, points[0])

        return points

    }

    getWorldLinear() {

        let matrix = this.getWorldTransformMatrix()

        let points = this.getLinear()

        return points.map(point => TransformMatrix.multVec(matrix, point))

    }

    /**
     * Get the list of segments between the points in order
     * Returns an empty list if there is only one point
     * 
     * @returns {Segment[]}
     */
    getSegments(): Segment[] {

        let segments = []

        let points = this.getLinear()

        if (points.length < 3) return segments

        for (let index = 0; index < points.length - 1; index++) {
            segments.push(new Segment(points[index].clone(), points[index + 1].clone()))
        }

        return segments

    }

    getWorldSegment(): Segment[] {

        let segments = []

        let points = this.getWorldLinear()

        if (points.length < 2) return segments

        for (let index = 0; index < points.length; index++) {
            segments.push(new Segment(points[index].clone(), points[(index + 1) % points.length].clone()))
        }

        return segments

    }

    /**
     * Draw the polygon
     * Should not be called by the user
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx: CanvasRenderingContext2D) {

        if (this.outer.length < 3) return

        ctx.fillStyle = ctx.strokeStyle = 'yellow'
        ctx.beginPath()
        ctx.moveTo(this.outer[0].x, this.outer[0].y)
        for (let index = 1; index <= this.outer.length; index++) {
            ctx.lineTo(this.outer[index % this.outer.length].x, this.outer[index % this.outer.length].y)
        }
        ctx.closePath()

        for (let inner of this.inners) {

            ctx.moveTo(inner[0].x, inner[0].y)

            for (let index = 1; index <= inner.length; index++)
                ctx.lineTo(inner[index % inner.length].x, inner[index % inner.length].y)
            ctx.closePath()

        }

        if (this.fill)
            ctx.fill()
        else ctx.stroke()

    }

    containsVector(vector: Vector): boolean {

        let segments = this.getSegments()

        let count = 0

        let ray = new Ray(vector, new Vector(1, 0))

        for (let segment of segments) if (ray.intersect(segment)) count++

        return (count & 1) === 1

    }

    containsWorldVector(vector: Vector): boolean {

        let segments = this.getWorldSegment()

        let count = 0

        let ray = new Ray(vector, new Vector(1, 0))

        for (let segment of segments) if (ray.intersect(segment)) count++

        return (count & 1) === 1

    }


}

/**
 * 
 */
export class Rectangle extends Polygon {

    display: boolean = false
    displayColor: string = 'red'

    #ptmem: Vector[] = [new Vector(), new Vector()]

    constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1, display: boolean = false, displayColor: string = 'red') {

        super([], [])

        this.transform.translation.set(x, y)
        this.transform.scale.set(w, h)

        this.#ptmem[0].copy(this.transform.translation)
        this.#ptmem[1].copy(this.transform.scale)

        this.display = display
        this.displayColor = displayColor

    }

    getLinear(): Vector[] {

        if (this.outer.length === 0 || !this.#ptmem[0].equal(this.transform.translation) || !this.#ptmem[1].equal(this.transform.scale)) {

            this.outer = [this.topleft, this.bottomleft, this.bottomright, this.topright]
            this.#ptmem[0].copy(this.transform.translation)
            this.#ptmem[1].copy(this.transform.translation)

        }

        return super.getLinear()

    }

    get x(): number { return this.transform.translation.x }
    set x(n: number) { this.transform.translation.x = n }
    get y(): number { return this.transform.translation.y }
    set y(n: number) { this.transform.translation.y = n }
    get w(): number { return this.transform.scale.x }
    set w(n: number) { this.transform.scale.x = n }
    get h(): number { return this.transform.scale.y }
    set h(n: number) { this.transform.scale.y = n }

    get halfW(): number { return this.transform.scale.x / 2 }
    set halfW(n: number) { this.transform.scale.x = n * 2 }
    get halfH(): number { return this.transform.scale.y / 2 }
    set halfH(n: number) { this.transform.scale.y = n * 2 }

    get left(): number { return this.transform.translation.x - this.halfW }
    set left(n: number) { this.transform.translation.x = n + this.halfW }
    get right(): number { return this.transform.translation.x + this.halfW }
    set right(n: number) { this.transform.translation.x = n - this.halfW }
    get bottom(): number { return this.transform.translation.y - this.halfH }
    set bottom(n: number) { this.transform.translation.y = n + this.halfH }
    get top(): number { return this.transform.translation.y + this.halfH }
    set top(n: number) { this.transform.translation.y = n - this.halfH }

    get topleft(): Vector { return new Vector(this.left, this.top) }
    set topleft(v: Vector) { this.left = v.x; this.top = v.y }
    get bottomleft(): Vector { return new Vector(this.left, this.bottom) }
    set bottomleft(v: Vector) { this.left = v.x; this.bottom = v.y }
    get topright(): Vector { return new Vector(this.right, this.top) }
    set topright(v: Vector) { this.right = v.x; this.top = v.y }
    get bottomright(): Vector { return new Vector(this.right, this.bottom) }
    set bottomright(v: Vector) { this.right = v.x; this.bottom = v.y }

    contains(vector: Vector): boolean { return vector.x <= this.right && vector.x >= this.left && vector.y <= this.top && vector.y >= this.bottom }

    collide(rect: Rectangle) {

        return this.left < rect.right &&
            rect.left < this.right &&
            this.bottom < rect.top &&
            rect.bottom < this.top

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.display) {

            ctx.save()
            ctx.scale(1 / this.w, 1 / this.h)

            ctx.strokeStyle = this.displayColor
            ctx.strokeRect(this.left, this.bottom, this.w, this.h)
            ctx.fillStyle = this.displayColor
            ctx.fillRect(-1, -1, 2, 2)

            ctx.restore()

        }

        return true

    }

    toString() {

        return `Rectangle(${this.x}, ${this.y}, ${this.w}, ${this.h})`

    }

}

export class Segment extends GameObject {

    a: Vector = new Vector()
    b: Vector = new Vector()
    display: boolean = false
    lineWidth: number = 1

    constructor(a: Vector, b: Vector, display: boolean = false) {

        super()

        this.a = a
        this.b = b
        this.display = display

    }

    intersect(segment: Segment): Vector {

        let seg1a = segment.getWorldPosition(segment.a.clone())
        let seg1b = segment.getWorldPosition(segment.b.clone())
        let seg2a = this.getWorldPosition(this.a.clone())
        let seg2b = this.getWorldPosition(this.b.clone())

        let x1 = seg1a.x
        let y1 = seg1a.y
        let x2 = seg1b.x
        let y2 = seg1b.y

        let x3 = seg2a.x
        let y3 = seg2a.y
        let x4 = seg2b.x
        let y4 = seg2b.y

        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        if (denum === 0) return null

        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum

        if (t < 0 || t > 1 || u < 0 || u > 1) return null

        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1))

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.display) {

            ctx.strokeStyle = 'red'
            ctx.beginPath()
            ctx.lineWidth = this.lineWidth
            ctx.moveTo(this.a.x, this.a.y)
            ctx.lineTo(this.b.x, this.b.y)
            ctx.stroke()
        }

        return true

    }


}

export class Ray extends GameObject {

    direction: Vector = new Vector()

    constructor(position: Vector, direction: Vector) {

        super()

        this.transform.translation.copy(position)
        this.direction = direction

    }

    intersect(segment: Segment): Vector {

        let sega = segment.getWorldPosition(segment.a.clone())
        let segb = segment.getWorldPosition(segment.b.clone())
        let wp = this.getWorldPosition()
        let wpdir = this.getWorldPosition(this.direction.clone().normalize())

        let x1 = sega.x
        let y1 = sega.y
        let x2 = segb.x
        let y2 = segb.y

        let x3 = wp.x
        let y3 = wp.y
        let x4 = wpdir.x
        let y4 = wpdir.y

        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        if (denum === 0) return null

        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum

        if (t < 0 || t > 1 || u < 0) return null

        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1))

    }

    cast(segments: Segment[]): Vector {

        let result: Vector = null
        let length: number = 0

        for (let segment of segments) {

            let intersect = this.intersect(segment)
            if (intersect) {
                let intersectLength = this.transform.translation.distanceTo(intersect)
                if (result === null || intersectLength < length) {
                    result = intersect
                    length = intersectLength
                }
            }

        }

        return result

    }

    draw(ctx: CanvasRenderingContext2D): boolean {


        ctx.strokeStyle = 'blue'
        ctx.strokeRect(-this.transform.scale.x, -this.transform.scale.y, this.transform.scale.x * 2, this.transform.scale.y * 2)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(this.direction.x * this.transform.scale.x * 5, this.direction.y * this.transform.scale.y * 5)
        ctx.stroke()

        return true

    }

}

export class RayCastVisible {

    static compute(position: Vector, segments: Segment[], infinity = 1000): Polygon {

        let uniques: Vector[] = [
            Vector.fromAngle(Math.PI / 4).multS(infinity),
            Vector.fromAngle(Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI / 4).multS(infinity)
        ]

        for (let segment of segments) {

            let sega = segment.getWorldPosition(segment.a.clone())
            let segb = segment.getWorldPosition(segment.b.clone())

            if (!uniques.some(pt => pt.equal(sega))) uniques.push(sega)
            if (!uniques.some(pt => pt.equal(segb))) uniques.push(segb)

        }

        let points: [number, Vector, Vector][] = []

        for (let unique of uniques) {

            let angle = unique.clone().sub(position).angle()

            let angle1 = angle + 0.00001
            let angle2 = angle - 0.00001

            let ray = new Ray(position.clone(), Vector.fromAngle(angle))
            let ray1 = new Ray(position.clone(), Vector.fromAngle(angle1))
            let ray2 = new Ray(position.clone(), Vector.fromAngle(angle2))

            let pt = ray.cast(segments)
            let pt1 = ray1.cast(segments)
            let pt2 = ray2.cast(segments)

            points.push([angle, pt ?? position.clone().add(ray.direction.multS(infinity)), pt?.clone().sub(position) ?? ray.direction])
            points.push([angle1, pt1 ?? position.clone().add(ray1.direction.multS(infinity)), pt1?.clone().sub(position) ?? ray1.direction])
            points.push([angle2, pt2 ?? position.clone().add(ray2.direction.multS(infinity)), pt2?.clone().sub(position) ?? ray2.direction])

        }

        points.sort((a, b) => b[0] - a[0])

        let polygon = new Polygon(points.map(e => e[2]))

        return polygon

    }

    static cropPolygon(ctx: CanvasRenderingContext2D, polygon: Polygon): void {

        let points = polygon.getLinear()

        if (points.length < 4) return

        ctx.globalCompositeOperation = 'destination-in'
        ctx.fillStyle = 'white'

        ctx.beginPath()

        ctx.moveTo(points[0].x, points[0].y)
        for (let index = 1; index < points.length - 1; index++)
            ctx.lineTo(points[index].x, points[index].y)

        ctx.fill()

        ctx.globalCompositeOperation = 'source-over'

    }

}

export class Drawable extends GameObject {

    image: HTMLImageElement = null
    size: Vector = new Vector()
    halfSize: Vector = new Vector()

    constructor(image) {

        super()

        this.image = image

        this.size.set(this.image.width, this.image.height)
        this.halfSize.copy(this.size).divS(2)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.scale(1 / this.size.x, -1 / this.size.y)
        ctx.drawImage(this.image, -this.halfSize.x, -this.halfSize.y)

        ctx.restore()

    }

}

const SpriteSheetOptions = {

    cellWidth: 16,
    cellHeight: 16,

}

export class SpriteSheet extends Drawable {

    options: typeof SpriteSheetOptions

    horizontalCount: number

    cursor: number = 0
    loopOrigin: number = 0
    tileInLoop: number = 1

    savedLoop: Map<string, [number, number]> = new Map()


    constructor(image: HTMLImageElement, options: typeof SpriteSheetOptions = SpriteSheetOptions) {

        super(image)

        this.options = { ...SpriteSheetOptions, ...options }

        this.horizontalCount = this.image.width / this.options.cellWidth
        this.size.set(this.options.cellWidth, this.options.cellHeight)
        this.halfSize.copy(this.size).divS(2)

    }

    XYToIndex(x: number, y: number) {

        return x + y * this.horizontalCount

    }

    indexToXY(index): [number, number] {

        let x = index % this.horizontalCount
        let y = Math.floor(index / this.horizontalCount)

        return [x, y]

    }

    saveLoop(name: string, loopOrigin: number, tileInLoop: number) { this.savedLoop.set(name, [loopOrigin, tileInLoop]) }

    useLoop(name: string, index: number = 0) { this.setLoop(...this.savedLoop.get(name), index) }

    isLoop(name: string): boolean { return this.loopOrigin == this.savedLoop.get(name)[0] }

    setLoop(loopOrigin: number, tileInLoop: number, startIndex: number = 0) {

        this.loopOrigin = loopOrigin
        this.tileInLoop = tileInLoop
        this.cursor = this.loopOrigin + startIndex % tileInLoop

    }

    getLoopIndex(): number { return this.cursor - this.loopOrigin }

    next() { this.cursor = this.loopOrigin + (this.getLoopIndex() + 1) % this.tileInLoop }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        let x = this.cursor % this.horizontalCount
        let y = Math.floor(this.cursor / this.horizontalCount)

        x *= this.size.x
        y *= this.size.y

        ctx.scale(1 / this.size.x, -1 / this.size.y)
        ctx.drawImage(this.image, x, y, this.size.x, this.size.y, -this.halfSize.x, -this.halfSize.y, this.size.x, this.size.y)

        ctx.restore()

    }

}

export class TextBox extends GameObject {

    text: string = ''
    active: boolean = false
    rect: Rectangle = new Rectangle(0, 0, 1, 1)

    fontSize: number
    font: string
    width: number
    color: string = 'white'
    onSound: string
    offSound: string

    placeholder: string = ''

    constructor(fontSize: number, width: number, font: string = 'sans-serif', color = 'black', onSound: string = null, offSound: string = null) {

        super()

        this.fontSize = fontSize
        this.font = font
        this.width = width
        this.color = color
        this.onSound = onSound
        this.offSound = offSound


        this.rect.transform.scale.set(width + 4, fontSize + 4)

        this.add(this.rect)

        window.addEventListener('keydown', async (event) => {

            if (this.active) {

                if (event.code === 'KeyV' && event.ctrlKey)
                    this.text += await navigator.clipboard.readText()
                else if (event.key.length === 1)
                    this.text += event.key
                else if (event.key === 'Backspace')
                    this.text = this.text.slice(0, -1)
                else if (event.key === 'Enter') {
                    this.rect.displayColor = 'red'
                    this.active = false

                    if (this.offSound) this.engine.soundBank.get(this.offSound)?.play()

                }
            }

        })

        this.drawAfterChildren()

    }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            if (this.rect.containsWorldVector(mouse.position)) {

                if (!this.active) {

                    this.rect.displayColor = 'blue'
                    this.active = true

                    if (this.onSound) this.engine.soundBank.get(this.onSound)?.play()
                }

            }

            else {

                if (this.active) {

                    this.rect.displayColor = 'red'
                    this.active = false

                    if (this.offSound) this.engine.soundBank.get(this.offSound)?.play()

                }

            }

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.translate(-this.width / 2, 0)
        ctx.scale(1, -1)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.font = `${this.fontSize}px ${this.font}`
        ctx.fillStyle = this.color

        let txt = this.text + (this.active ? '_' : '')
        if (txt.length === 0) txt = this.placeholder

        ctx.fillText(txt, 0, 0, this.width)

        ctx.restore()

    }

}

export class Button extends GameObject {


    text: string = ''
    #active: Timer = new Timer(0)
    rect: Rectangle = new Rectangle(0, 0, 1, 1)

    get active(): boolean { return this.#active.lessThan(150) }

    fontSize: number
    font: string
    width: number
    color: string = 'white'
    activeColor: string = 'gray'
    onSound: string

    constructor(fontSize: number, width: number, font: string = 'sans-serif', color = 'black', onSound: string = null, margin = 4) {

        super()

        this.fontSize = fontSize
        this.font = font
        this.width = width
        this.color = color
        this.onSound = onSound

        this.rect.transform.scale.set(width + margin, fontSize + margin)

        this.add(this.rect)

        this.drawAfterChildren()

    }

    get currentColor(): string { return this.active ? this.activeColor : this.color }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            if (this.rect.containsWorldVector(mouse.position) && !this.active) {

                this.#active.reset()
                this.onActive()

                if (this.onSound) this.engine.soundBank.get(this.onSound)?.play()

            }

        }

        if (this.active) this.rect.displayColor = 'blue'
        else this.rect.displayColor = 'red'

    }

    onActive() { }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.scale(1, -1)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `${this.fontSize}px ${this.font}`
        ctx.fillStyle = this.currentColor

        ctx.fillText(this.text, 0, 0, this.width)

        ctx.restore()

    }

}

export class Label extends GameObject {

    text: string = ''
    align: CanvasTextAlign = 'left'
    fontSize: number = 12
    font: string = 'sans-serif'
    color: string = 'white'
    baseline: CanvasTextBaseline = 'middle'
    maxWidth: number = 300

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
    constructor(text: string, align: CanvasTextAlign, fontSize: number, font: string, color: string, baseline: CanvasTextBaseline, maxWidth: number,) {

        super()

        this.text = text
        this.align = align
        this.fontSize = fontSize
        this.font = font
        this.color = color
        this.baseline = baseline
        this.maxWidth = maxWidth

        this.drawAfterChildren()

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.textAlign = this.align
        ctx.font = `${this.fontSize}px ${this.font}`
        ctx.textBaseline = this.baseline
        ctx.fillStyle = this.color

        ctx.scale(1, -1)
        ctx.fillText(this.text, 0, 0, this.maxWidth)

        ctx.restore()

    }

}

export class CheckBox extends GameObject {

    checked: boolean = false
    rect: Rectangle = new Rectangle(0, 0, 1, 1)
    rectColor: string
    checkColor: string
    size: number
    sound: string

    constructor(checked: boolean = false, size: number = 10, rectColor: string = 'white', checkColor: string = 'red', sound: string = null) {

        super()

        this.checked = checked
        this.rectColor = rectColor
        this.checkColor = checkColor
        this.size = size
        this.sound = sound

        this.rect.transform.scale.set(size, size)
        this.add(this.rect)

    }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (this.rect.containsWorldVector(mouse.position) && mouse.leftClick) {

            this.checked = !this.checked
            this.onChange()

            if (this.sound) this.engine.soundBank.get(this.sound)?.play()

        }

    }

    onChange() { }

    draw(ctx: CanvasRenderingContext2D): void {

        let hs = this.size / 2

        if (this.checked) {

            ctx.strokeStyle = this.checkColor
            ctx.beginPath()
            ctx.moveTo(-hs, -hs)
            ctx.lineTo(hs, hs)
            ctx.moveTo(-hs, hs)
            ctx.lineTo(hs, -hs)
            ctx.stroke()

        }

        ctx.strokeStyle = this.rectColor

        ctx.strokeRect(-hs, -hs, this.size, this.size)

    }

}

class Graph<T> extends GameObject {

    nodes: Set<number> = new Set()
    nodesObjects: Map<number, T> = new Map()
    links: Map<number, Set<number>> = new Map()
    display: boolean = false
    positionGetter: (object: T) => Vector = null

    constructor(display: boolean = false, positionGetter: (object: T) => Vector = null) {

        super()

        this.display = display
        this.positionGetter = positionGetter

    }

    /**
     * 
     * @param {...number} nodes 
     */
    addNode(...nodes: [number, T][]) {

        for (let [node, object] of nodes) {

            if (!this.nodes.has(node)) {

                this.nodes.add(node)
                this.nodesObjects.set(node, object)
                this.links.set(node, new Set())

            }

        }

    }

    /**
     * 
     * @param {...number} nodes 
     */
    removeNode(...nodes: number[]) {

        for (let node of nodes)
            if (this.hasNode(node)) {

                this.nodes.delete(node)
                this.nodesObjects.delete(node)
                this.links.delete(node)

                for (let [, map] of this.links)
                    map.delete(node)

            }

    }

    /**
     * 
     * @param {number} node 
     * @returns {boolean}
     */
    hasNode(node: number) { return this.nodes.has(node) }

    /**
     * 
     * @param {...{source:number, target:number, data:any}} links 
     */
    addLink(...links: { source: number, target: number }[]) {

        for (let link of links) {

            if (!this.hasNode(link.source) || !this.hasNode(link.target)) continue

            this.links.get(link.source).add(link.target)

        }

    }

    /**
     * 
     * @param {...{source:number, target:number}} links 
     */
    removeLink(...links: { source: number, target: number }[]) {

        for (let link of links)
            if (this.hasLink(link.source, link.target)) {

                this.links.get(link.source).delete(link.target)

            }

    }

    hasLink(source: number, target: number) { return this.links.has(source) && this.links.get(source).has(target) }

    isConnectedTo(source: number, target: number): boolean {

        if (!this.hasNode(source)) return false
        if (!this.hasNode(target)) return false

        let nodeSet: Set<number>
        let currentSet: Set<number> = new Set([source])

        do {

            nodeSet = currentSet
            currentSet = new Set(nodeSet)

            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target)

        } while (nodeSet.size != currentSet.size)

        return nodeSet.has(target)
    }

    isConnected(node: number): boolean {

        if (!this.hasNode(node)) return true

        let nodeSet: Set<number>
        let currentSet: Set<number> = new Set([node])

        do {

            nodeSet = currentSet
            currentSet = new Set(nodeSet)

            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target)

        } while (nodeSet.size != currentSet.size)

        return nodeSet.size == this.nodes.size

    }

    isFullyConnected(): boolean {

        for (let node of this.nodes)
            if (!this.isConnected(node)) return false

        return true

    }

    getShortestPathBetween(source: number, target: number, estimateDistance: (nodeA: T, nodeB: T) => number) {

        if (!this.hasNode(source) || !this.hasNode(target)) return null

        let nodes: Map<number, Node> = new Map()
        this.nodes.forEach(id => nodes.set(id, new Node(id)))

        let start = nodes.get(source)
        let end = nodes.get(target)

        let closed = []
        let opened = [start]

        while (opened.length) {

            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.heuristic < b.heuristic ? a : b)), 1)[0]
            let currentObject = this.nodesObjects.get(current.id)

            if (current == end) {

                let list = [end.id]
                let node = end

                while (node.previous) {

                    node = node.previous
                    list.push(node.id)

                }

                return list.reverse()

            }

            for (let neighbour of this.links.get(current.id)) {

                let node = nodes.get(neighbour)
                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id))

                if (!(closed.includes(node) || (opened.includes(node) && node.cost <= cost))) {

                    node.cost = cost
                    node.heuristic = node.cost + estimateDistance(this.nodesObjects.get(node.id), this.nodesObjects.get(end.id))
                    node.previous = current
                    opened.push(node)

                }

            }

            closed.push(current)

        }

        return null

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.display && this.positionGetter) {

            ctx.save()
            ctx.restore()

            let positions: Map<number, Vector> = new Map()

            for (let [node, object] of this.nodesObjects) {
                positions.set(node, this.positionGetter(object))
            }

            ctx.strokeStyle = 'blue'
            ctx.lineWidth = .1
            for (let nodeA of this.links) {

                for (let nodeB of nodeA[1]) {

                    let p1 = positions.get(nodeA[0])
                    let p2 = positions.get(nodeB)

                    ctx.beginPath()
                    ctx.moveTo(p1.x, p1.y)
                    ctx.lineTo(p2.x, p2.y)
                    ctx.stroke()

                }

            }


        }

        return true

    }

}

class Node {

    cost: number = 0
    heuristic: number = 0
    previous: Node = null
    id: number

    constructor(id: number) { this.id = id }

}

class Path {

    points: Vector[] = []
    currentPosition: Vector = new Vector()
    currentSegment = 1

    constructor(vectors: Vector[]) {

        this.points = vectors
        this.currentPosition.copy(this.points[0])

    }

    length(): number {

        let length = 0

        for (let index = 0; index < this.points.length - 1; index++)
            length += this.points[index].distanceTo(this.points[index + 1])

        return length

    }

    reset() {
        this.currentPosition.copy(this.points[0])
        this.currentSegment = 0
    }

    end(): boolean { return this.points.length == this.currentSegment }

    follow(length: number): Vector {

        let next = this.points[this.currentSegment]
        let distance = this.currentPosition.distanceTo(next)

        while (distance <= length) {

            length -= distance
            this.currentPosition.copy(next)
            next = this.points[++this.currentSegment]
            distance = this.currentPosition.distanceTo(next)
            if (this.currentSegment == this.points.length)
                return this.currentPosition.clone()

        }

        this.currentPosition.add(next.clone().sub(this.currentPosition).normalize().multS(length))

        return this.currentPosition.clone()

    }

}

export class ImageManipulator extends GameObject {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    constructor(width: number = 1, height: number = 1) {

        super()

        this.canvas = document.createElement('canvas')

        this.canvas.width = width
        this.canvas.height = height

        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false

    }

    get width(): number { return this.canvas.width }

    get height(): number { return this.canvas.height }

    setSize(width: number, height: number) {

        let tmpcanvas = document.createElement('canvas')
        tmpcanvas.width = this.canvas.width
        tmpcanvas.height = this.canvas.height
        let tmpctx = tmpcanvas.getContext('2d')
        tmpctx.imageSmoothingEnabled = false
        tmpctx.drawImage(this.canvas, 0, 0)

        this.canvas.width = width
        this.canvas.height = height

        this.ctx.imageSmoothingEnabled = false

        this.ctx.drawImage(tmpcanvas, 0, 0)

    }

    setPixel(x: number, y: number, color: string) {

        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, 1, 1)

    }

    setPixelRGBA(x: number, y: number, r: number, g: number, b: number, a: number) {

        let imageData = new ImageData(1, 1)

        imageData.data.set([r, g, b, a])

        this.ctx.putImageData(imageData, x, y)

    }

    getPixel(x: number, y: number): [number, number, number, number] {

        let data: ImageData = this.ctx.getImageData(x, y, 1, 1)

        return [data.data[0], data.data[1], data.data[2], data.data[3]]

    }

    print(): string { return this.canvas.toDataURL('image/png') }

    download(name: string): void {

        let a = document.createElement('a')
        a.href = this.print()
        a.download = `${name}_${this.width}x${this.height}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()

    }

    getImage(): HTMLImageElement {

        let image = document.createElement('img')

        image.src = this.print()

        return image

    }

    toString(): string { return this.print() }

    clone(): ImageManipulator {

        let im = new ImageManipulator(this.width, this.height)

        im.ctx.drawImage(this.canvas, 0, 0)

        return im

    }

    static fromImage(image: HTMLImageElement): ImageManipulator {

        let im = new ImageManipulator(image.width, image.height)

        im.ctx.drawImage(image, 0, 0)

        return im

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.scale(1 / this.width, -1 / this.height)
        ctx.drawImage(this.canvas, -this.width / 2, -this.height / 2)

        ctx.restore()

    }

}

export class PseudoRandom {

    static a: number = 1664525
    static c: number = 1013904223
    static m: number = Math.pow(2, 32)

    seed: number
    a: number = PseudoRandom.a
    c: number = PseudoRandom.c
    m: number = PseudoRandom.m

    constructor(seed: number = Math.random()) {

        this.seed = seed

    }

    get() {

        this.seed = (this.a * this.seed + this.c) % this.m
        return this.seed / this.m

    }

    static get(seed: number = Math.random()) {

        return ((PseudoRandom.a * seed + PseudoRandom.c) % PseudoRandom.m) / PseudoRandom.m

    }

}

export class PerlinNoise {

    rng: PseudoRandom
    seed: number
    grid: Vector[][][]
    horizontalLoop: number
    verticalLoop: number
    depthLoop: number

    constructor(seed: number = Math.random(), horizontalLoop: number = 2048, verticalLoop: number = 2048, depthLoop: number = 2048) {

        this.seed = seed
        this.horizontalLoop = horizontalLoop
        this.verticalLoop = verticalLoop
        this.depthLoop = depthLoop

        this.rng = new PseudoRandom(seed)

        this.grid = []

        for (let x of range(horizontalLoop)) {
            this.grid.push([])
            for (let y of range(verticalLoop)) {
                this.grid[x].push([])
                for (let z of range(depthLoop)) {

                    // let r = this.rng.get() * Math.PI * 2
                    let s = this.seed ^ x ^ (y * 57) ^ (z * 29)

                    let xv = Math.cos(s)
                    let yv = Math.sin(s)
                    let zv = PseudoRandom.get(s) * 2 - 1

                    let vec = new Vector(xv, yv, zv)

                    this.grid[x][y].push(vec)
                }

            }

        }

    }

    fade(t: number) {

        return t * t * t * (t * (t * 6 - 15) + 10)

    }

    getVector(ix: number, iy: number, iz: number): Vector {

        ix = ((ix % this.horizontalLoop) + this.horizontalLoop) % this.horizontalLoop
        iy = ((iy % this.verticalLoop) + this.verticalLoop) % this.verticalLoop
        iz = ((iz % this.depthLoop) + this.depthLoop) % this.depthLoop

        let vec = this.grid[ix][iy][iz]

        return vec

    }

    gradDotProduct(ix: number, iy: number, iz: number, x: number, y: number, z: number): number {

        let distanceVector = new Vector(x - ix, y - iy, z - iz)
        let grad = this.getVector(ix, iy, iz)

        let product = distanceVector.dot(grad)

        return product

    }

    get(x: number, y: number, z: number = 0): number {

        let x0 = Math.floor(x)
        let x1 = x0 + 1
        let y0 = Math.floor(y)
        let y1 = y0 + 1
        let z0 = Math.floor(z)
        let z1 = z0 + 1

        let sx = this.fade(x - x0)
        let sy = this.fade(y - y0)
        let sz = this.fade(z - z0)


        let n0: number, n1: number, lpy0: number, lpy1: number, lpz0: number, lpz1: number, value: number

        n0 = this.gradDotProduct(x0, y0, z0, x, y, z)
        n1 = this.gradDotProduct(x1, y0, z0, x, y, z)
        lpy0 = lerp(n0, n1, sx)
        n0 = this.gradDotProduct(x0, y1, z0, x, y, z)
        n1 = this.gradDotProduct(x1, y1, z0, x, y, z)
        lpy1 = lerp(n0, n1, sx)
        lpz0 = lerp(lpy0, lpy1, sy)

        n0 = this.gradDotProduct(x0, y0, z1, x, y, z)
        n1 = this.gradDotProduct(x1, y0, z1, x, y, z)
        lpy0 = lerp(n0, n1, sx)
        n0 = this.gradDotProduct(x0, y1, z1, x, y, z)
        n1 = this.gradDotProduct(x1, y1, z1, x, y, z)
        lpy1 = lerp(n0, n1, sx)
        lpz1 = lerp(lpy0, lpy1, sy)

        value = lerp(lpz0, lpz1, sz)

        return value

    }

}

export class TextureMapper {

    static map(modelIM: ImageManipulator, colorChartIM: ImageManipulator, textureIM: ImageManipulator): ImageManipulator {


        let outputIM = new ImageManipulator(modelIM.width, modelIM.height)

        for (let x = 0; x < modelIM.width; x++)
            for (let y = 0; y < modelIM.height; y++) {

                let modelColor = modelIM.getPixel(x, y)

                if (modelColor[3] == 0) continue

                // console.log(modelColor)

                let pixelLocation = TextureMapper.#findPixelWithColorInImage(colorChartIM, ...modelColor)

                // console.log(pixelLocation)

                if (!pixelLocation) continue

                let color = textureIM.getPixel(...pixelLocation)

                // console.log(color)

                outputIM.setPixelRGBA(x, y, ...color)

            }

        return outputIM

    }

    static #findPixelWithColorInImage(image: ImageManipulator, r: number, g: number, b: number, a: number): [number, number] {

        for (let x = 0; x < image.width; x++)
            for (let y = 0; y < image.height; y++) {

                let data = image.getPixel(x, y)

                if (data[3] == a && data[0] == r && data[1] == g && data[2] == b)
                    return [x, y]
            }

        return null
    }

    static downloadStandardColorChart(width: number, height: number) {

        if (width < 1 || width > 256 || height < 0 || height > 256) throw `Invalid dimensions`

        let im = new ImageManipulator(width, height)

        for (let r = 0; r < width; r++)
            for (let g = 0; g < height; g++) {

                let color = `rgb(${255 - r * 256 / width}, ${255 - g * 256 / height}, ${Math.max(r * 256 / width, g * 256 / height)})`

                console.log(r, g, color)

                im.setPixel(r, g, color)

            }

        im.download('colorchart')

    }

}

export function lerp(a: number, b: number, t: number): number { return (1 - t) * a + t * b }

export function coserp(a: number, b: number, t: number): number {

    let t2 = (1 - Math.cos(t * Math.PI)) / 2

    return (1 - t2) * a + t2 * b

}

export function map(nbr: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number) {

    let t = (nbr - sourceMin) / (sourceMax - sourceMin)
    let res = t * (targetMax - targetMin) + targetMin

    return res
}

let idCount = 0
export function id() { return ++idCount }

export function* range(min: number, max: number = null, step: number = 1) {

    if (!max) {
        max = min
        min = 0
    }

    for (let i = min; i < max; i += step)
        yield i

}

class NetworkEvents {

    static PEER_OPENED = 0 // id has been obtained
    static UNAVAILABLE_ID = 13 // id could not be obtained
    static INVALID_ID = 14 // id is invalid
    static PEER_CONNECTION = 1 // A user is connecting to you
    static PEER_CLOSED = 2 // When peer is destroyed
    static PEER_DISCONNECT = 3 // Disconnected from signaling server
    static PEER_ERROR = 4 // Fatal errors, moslty

    static HOST_P2P_OPENED = 5
    static HOST_P2P_CLOSED = 6
    static HOST_P2P_RECEIVED_DATA = 7

    static CLIENT_P2P_OPENED = 8
    static CLIENT_P2P_CLOSED = 9
    static CLIENT_P2P_RECEIVED_DATA = 10
    static CLIENT_P2P_CONFIRMED_CONNECTION = 15

    static HOSTING_START = 11
    static HOSTING_END = 12

}

/**
 * The Network class uses PeerJS to manage P2P connection.
 * On top of peerjs it manages timeouts conditional hosting (whitelist blacklist)
 *    and auto rejection against unwanted connections.
 */
export class Network {

    static events = NetworkEvents
    static peer: any = null
    static id: string = null
    static isHosting: boolean = false
    static maxClient: number = 15

    static acceptConnections: boolean = true
    static useWhitelist: boolean = true
    static whitelist: string[] = []
    static blacklist: string[] = []

    static connections: Map<string, NetworkConnection> = new Map()

    static callbacks: Map<NetworkEvents, ((data: any) => void)[]> = new Map()

    /**
     * Returns true if SimplePeer is defined in the window object
     * This value should be defined by default by the simple-peer implementaton
     * 
     * @returns {boolean}
     */
    static enabled(): boolean { return window.Peer != null }

    /**
     * Throw an error if Network.enabled returns false
     */
    static assertEnabled() { if (!Network.enabled()) throw new Error('PeerJS must be included and defined in window.Peer for Network functionalities to work') }

    /**
     * Returns true if there is any connection currenlty active
     * 
     * @returns {boolean}
     */
    static hasConnections(): boolean { return Network.connections.size !== 0 }

    /**
     * Returns true if the network is hosting and the number of connection currently active is at least equal to Network.maxClient
     * 
     * @returns {boolean}
     */
    static isFull(): boolean { return Network.connections.size >= Network.maxClient }

    /**
     * Connect to the signaling server 
     * 
     * @param {string} id 
     * @param {any} options see peerjs documentation for Peer options
     */
    static start(id: string, options: any = undefined): any {

        let peer = new window.Peer(id, options)

        peer.on('open', () => {

            Network.peer = peer;
            Network.id = peer.id

            for (let callback of Network.getCallbacks(NetworkEvents.PEER_OPENED))
                callback.call(Network, Network.id)

        })

        peer.on('connection', (conn) => {

            let networkConnection = new NetworkConnection(conn, true)

            this.connections.set(networkConnection.id, networkConnection)

            for (let callback of Network.getCallbacks(NetworkEvents.PEER_CONNECTION))
                callback.call(Network, networkConnection)
        })

        peer.on('close', () => {

            for (let callback of Network.getCallbacks(NetworkEvents.PEER_CLOSED))
                callback.call(Network)

        })

        peer.on('error', (error) => {

            if (error.type === 'unavailable-id')
                for (let callback of Network.getCallbacks(NetworkEvents.UNAVAILABLE_ID))
                    callback.call(Network)

            else if (error.type === 'invalid-id')
                for (let callback of Network.getCallbacks(NetworkEvents.INVALID_ID))
                    callback.call(Network)

            else for (let callback of Network.getCallbacks(NetworkEvents.PEER_ERROR))
                callback.call(Network, error)

        })

        peer.on('disconnected', () => {

            for (let callback of Network.getCallbacks(NetworkEvents.PEER_DISCONNECT))
                callback.call(Network)

        })

    }


    static reconnect(): void {

        if (Network.peer && Network.peer.disconnected) Network.peer.reconnect()

    }

    /**
     * Enable hosting, if any connection is opened at time, 
     * uses abortIfConnections to determined if those connections should be closed and the operation should proceed
     * Returns the new state of isHosting
     * 
     * @param {boolean} abortIfConnections 
     * @returns {boolean} 
     */
    static enableHosting(abortIfConnections: boolean = false): boolean {

        if (!Network.isHosting)
            if (!Network.hasConnections() || !abortIfConnections) {

                this.isHosting = true
                Network.closeAllConnections()

            }



        return this.isHosting

    }

    /**
     * Disable hosting, if any connection is opened at time, 
     * uses abortIfConnections to determined if those connections should be closed and the operation should proceed.
     * Returns the new state of isHosting.
     * 
     * @param {boolean} abortIfConnections 
     * @returns {boolean} 
     */
    static disableHosting(abortIfConnections: boolean = false): boolean {

        if (Network.isHosting)
            if (!Network.hasConnections() || !abortIfConnections) {

                Network.closeAllConnections()
                this.isHosting = false

            }

        return this.isHosting

    }

    /**
     * Tries to connect to a given peer.
     * will throw an error if not connected to the signaling server or currently hosting.
     * Will automaticaly store the connectino into Network.connections.
     * Will throw an error if you are already connected to a peer.
     * 
     * @param {string} id 
     * @returns {NetworkConnection}
     */
    static connectTo(id: string): NetworkConnection {

        if (id === this.id) throw `You can't connect to yourself`
        if (!Network.peer) throw `You can't connect to somebody without starting the Network and being connected to the signaling server`
        if (Network.isHosting) throw `You can't connect to somebody while hosting`
        if (Network.hasConnections()) throw `You can only connect to one peer at a time`

        let networkConnection = new NetworkConnection(Network.peer.connect(id), false)

        Network.connections.set(networkConnection.id, networkConnection)

        return networkConnection

    }

    /**
     * Send any data to a given connected peer if it exists
     * 
     * @param {string} id 
     * @param {any} data 
     */
    static sendTo(id: string, data: any): void {

        Network.connections.get(id)?.connection.send(data)

    }

    /**
     * Send any data to every connected peer
     * 
     * @param {any} data 
     */
    static sendToAll(data: any): void {

        for (let connection of Network.connections)
            connection[1].connection.send(data)

    }

    /**
     * Send any data to every connected peer except a given one
     * 
     * @param {string} id 
     * @param {any} data 
     */
    static sendToAllExcept(id: string, data: any): void {

        for (let connection of Network.connections) if (connection[0] !== id)
            connection[1].connection.send(data)

    }

    /**
     * Close the connection to a given peer if it exists
     * 
     * @param {string} id 
     */
    static closeConnection(id: string): void {

        Network.connections.get(id)?.cleanclose()

    }

    /**
     * Close the connection with all connected peer
     */
    static closeAllConnections(): void {

        for (let connection of Network.connections)
            connection[1].cleanclose()

    }

    /**
     * Add a callback for a given event
     * 
     * @param {NetworkEvents} event 
     * @param callback 
     */
    static on(event: NetworkEvents, callback: (data: any) => void): void {

        if (!Network.callbacks.has(event))
            Network.callbacks.set(event, [])

        Network.callbacks.get(event).push(callback)

    }

    /**
     * Returns all callbacks associated with the given event
     * 
     * @param {NetworkEvents} event 
     * @returns {((data:any)=>void)[]}
     */
    static getCallbacks(event: NetworkEvents): ((data: any) => void)[] {
        return Network.callbacks.get(event) ?? []
    }

    /**
     * Puts a given id into the whitelist
     * 
     * @param {string} id 
     */
    static allow(id: string): void {

        Network.whitelist.push(id)

    }

    /**
     * Removes a given id from the whitelist, closing the connection if it exists
     * 
     * @param {string} id 
     */
    static deny(id: string): void {

        let index = Network.whitelist.indexOf(id)

        if (index !== -1)
            Network.whitelist.splice(index, 1)

        if (this.useWhitelist && this.isHosting)
            Network.connections.get(id)?.cleanclose()

    }

    /**
     * Puts a given id into the blacklist, closing the connection if it exists
     * 
     * @param {string} id 
     */
    static ban(id: string): void {

        Network.blacklist.push(id)

        Network.connections.get(id)?.cleanclose()

    }

    /**
     * Removes a given id from the blacklist
     * 
     * @param {string} id 
     */
    static unban(id: string): void {

        let index = Network.blacklist.indexOf(id)

        if (index !== -1)
            Network.blacklist.splice(index, 1)

    }

}

class NetworkConnection {

    connection: any
    timer: Timer = new Timer()
    intervalID: NodeJS.Timer
    receiver: boolean

    constructor(connection: any, receiver: boolean) {

        this.connection = connection
        this.receiver = receiver

        this.intervalID = setInterval(this.#timeout.bind(this), 1000)

        this.connection.on('open', this.#open.bind(this))
        this.connection.on('close', this.#close.bind(this))
        this.connection.on('data', this.#data.bind(this))

    }

    #timeout(): void {

        if (this.timer.greaterThan(6000)) {

            this.cleanclose()

            // console.log(`Connection with "${this.id}" timed out`)

        } else
            this.connection.send('Network$IAMHERE')

    }

    #open(): void {

        // console.log(`connection opened with ${this.id}`)

        if (this.receiver) {

            if (!Network.isHosting || !Network.acceptConnections ||
                Network.isFull() ||
                Network.blacklist.includes(this.id) ||
                Network.useWhitelist && !Network.whitelist.includes(this.id)) {

                this.cleanclose()

            } else {

                for (let callback of Network.getCallbacks(NetworkEvents.HOST_P2P_OPENED))
                    callback.call(this)

                this.connection.send('Network$CONFIRM')

            }


        } else {

            for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_OPENED))
                callback.call(this)

        }

    }

    #close(): void {

        // console.log(`connection closed with ${this.id}`)

        if (this.receiver) {

            for (let callback of Network.getCallbacks(NetworkEvents.HOST_P2P_CLOSED))
                callback.call(this)

        } else {

            for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_CLOSED))
                callback.call(this)

        }

        this.clean()

    }

    #data(data: any): void {

        this.timer.reset()

        if (data === 'Network$CLOSE')
            this.cleanclose()

        else if (data === 'Network$IAMHERE')
            return

        else if (data === 'Network$CONFIRM' && !this.receiver)
            for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_CONFIRMED_CONNECTION))
                callback.call(this, data)

        else
            if (this.receiver)
                for (let callback of Network.getCallbacks(NetworkEvents.HOST_P2P_RECEIVED_DATA))
                    callback.call(this, data)

            else
                for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_RECEIVED_DATA))
                    callback.call(this, data)




    }

    get id() { return this.connection.peer }

    /**
     * Removes the connection from Network.connections and deletes the timeout interval
     */
    clean(): void {

        clearInterval(this.intervalID)

        Network.connections.delete(this.id)

    }

    /**
     * Sends a closing message to the connected peer and closes the connection with it
     */
    close(): void {

        this.connection.send('Network$CLOSE')

        setTimeout(() => { this.connection.close() }, 250)

    }

    /**
     * Execute the function this.clean() and this.close()
     */
    cleanclose() {

        this.clean()
        this.close()

    }

}

export class NetworkGameObject extends GameObject {

    static list: Map<string, Map<number, NetworkGameObject>> = new Map()
    static inherited: Map<string, new () => NetworkGameObject> = new Map()
    static pendingUpdates: any[] = []

    static inherit() { NetworkGameObject.inherited.set(this.name, this) }
    static { this.inherit() }

    static build(instruction: { data: any, proto: string }): NetworkGameObject {

        let object = new (NetworkGameObject.inherited.get(instruction.proto))()

        object.owner = instruction.data.owner
        object.secID = instruction.data.id
        object.source(instruction.data)

        return object

    }

    static register(object: NetworkGameObject, owner: string, id: number) {

        if (!NetworkGameObject.list.has(owner))
            NetworkGameObject.list.set(owner, new Map())

        NetworkGameObject.list.get(owner).set(id, object)

    }

    static getRegistered(owner: string): NetworkGameObject[] {

        return [...(NetworkGameObject.list.get(owner)?.values() ?? [])]

    }

    static getRegisteredObject(owner: string, id: number): NetworkGameObject {

        if (!NetworkGameObject.isRegistered(owner, id)) return null

        return NetworkGameObject.list.get(owner).get(id)

    }

    static isRegistered(owner: string, id: number): boolean {

        return NetworkGameObject.list.has(owner) && NetworkGameObject.list.get(owner).has(id)

    }

    static flushPendingUpdates(): void {

        Network.sendToAll({ event: 'Network$updates', data: NetworkGameObject.pendingUpdates })

        NetworkGameObject.pendingUpdates = []

    }

    static hasPendingUpdates(): boolean { return this.pendingUpdates.length !== 0 }

    secID: number = null
    synced: boolean = false
    owner: string = null
    syncedFunctions: string[] = []

    constructor() {

        super()

    }

    source(data: any): void { }

    getSource(): any { return badclone(this) }

    sync(): void {

        if (!window.Peer) return

        if (!this.synced) {

            this.synced = true
            this.owner = Network.id
            this.secID = this.id

            NetworkGameObject.register(this, Network.id, this.id)

        }

        if (this.owner !== Network.id) return

        let parent = this.parent as NetworkGameObject

        let message = {
            event: 'Network$newobject',
            data: {
                data: this.getSource(),
                proto: this.constructor.name,
                owner: Network.id,
                scene: this.scene?.id,
                parent: {
                    owner: parent?.owner,
                    id: parent?.secID
                }
            }
        }

        Network.sendToAll(message)

    }

    syncCalls(...functionsName: string[]) {

        for (let name of functionsName) {

            this.syncedFunctions.push(name)

            let func = this[name]
            this[name] = function () {

                console.log('called synced function')

                this.sendUpdate({ event: 'CALLFUNCTION', func: name, args: arguments })

                func(...arguments)

            }

        }

    }

    sendUpdate(data): void {

        let message = { owner: this.owner, id: this.secID, data }

        NetworkGameObject.pendingUpdates.push(message)

    }

    recvUpdate(data): void { }

    syncMoveToObject(owner: string, id: number) {

        NetworkGameObject.getRegisteredObject(owner, id).add(this)

        let message = {
            move: true, owner: this.owner, id: this.secID, data: {
                scene: undefined,
                parent: { owner, id }
            }
        }

        NetworkGameObject.pendingUpdates.push(message)

    }

    syncMoveToScene(scene: string) {

        GameScene.list.get(scene).add(this)

        let message = {
            move: true, owner: this.owner, id: this.secID, data: {
                scene,
                parent: {}
            }
        }

        NetworkGameObject.pendingUpdates.push(message)

    }

    syncKill(): void {

        this.kill()

        let message = {
            kill: true, owner: this.owner, id: this.secID
        }

        NetworkGameObject.pendingUpdates.push(message)

        NetworkGameObject.list.get(this.owner).delete(this.secID)

    }

    isMine(): boolean { return this.owner === Network.id }

}

{ // Auto NetworkGameObject Management

    function moveObjectTo(object: NetworkGameObject, scene: string, parent: any) {

        if (scene) {

            if (!GameScene.list.has(scene))
                throw `Missing stored scene with id ${scene}`

            GameScene.list.get(scene).add(object)

        } else {

            if (!NetworkGameObject.isRegistered(parent.owner, parent.id)) throw `Missing move target for object ${object.owner}:${object.secID}`

            NetworkGameObject.getRegisteredObject(parent.owner, parent.id).add(object)

        }

    }

    function killObject(owner: string, id: number) {

        if (NetworkGameObject.isRegistered(owner, id)) {

            let object = NetworkGameObject.getRegisteredObject(owner, id)

            object.kill()
            NetworkGameObject.list.get(owner).delete(object.secID)

        }

    }

    function createObject(message) {

        if (message.event === 'Network$newobject') {

            let { data, owner, scene, parent } = message.data

            if (NetworkGameObject.isRegistered(owner, data.id)) return

            let object = NetworkGameObject.build(message.data)
            object.source(message.data.data)

            NetworkGameObject.register(object, owner, data.id)
            moveObjectTo(object, scene, parent)

        }

    }

    function newuser(message) {

        if (message.event === 'Network$newuser') {

            executeSync()

        }

    }

    function executeSync() {

        for (let object of NetworkGameObject.getRegistered(Network.id))
            object.sync()

    }

    function updates(message) {

        if (message.event === 'Network$updates') {

            let updates = message.data

            for (let update of updates) {

                let object = NetworkGameObject.getRegisteredObject(update.owner, update.id)

                if (object) {
                    if (update.move) {

                        moveObjectTo(object, update.data.scene, update.data.parent)

                    }

                    else if (update.kill) {

                        killObject(update.owner, update.id)

                    }

                    else if (typeof update.data === 'object' && update.data.event === 'CALLFUNCTION') {

                        if (object.syncedFunctions.includes(message.data.func))
                            object[message.data.func](message.data.are)

                    }

                    else object.recvUpdate(update.data)
                }

            }

        }

    }

    Network.on(NetworkEvents.PEER_OPENED, function (id) {

        let nulls = NetworkGameObject.list.get(null) ?? []

        for (let [key, object] of nulls) {

            object.synced = false
            object.owner = null
            object.secID = null
            object.sync()

        }

        NetworkGameObject.list.delete(null)

    })

    Network.on(NetworkEvents.CLIENT_P2P_OPENED, function () {

        executeSync()

    })

    Network.on(NetworkEvents.HOST_P2P_OPENED, function () {

        executeSync()

        Network.sendToAllExcept(this.id, { event: 'Network$newuser', data: this.id })

    })

    Network.on(NetworkEvents.CLIENT_P2P_CLOSED, function () {

        for (let [owner, objects] of NetworkGameObject.list) {

            if (owner === Network.id) continue

            for (let [id, object] of objects)
                object.kill()

            NetworkGameObject.list.delete(owner)

        }

    })

    Network.on(NetworkEvents.HOST_P2P_CLOSED, function () {

        Network.sendToAll({ event: 'Network$killuser', data: this.id })

        let objects = NetworkGameObject.getRegistered(this.id)

        for (let object of objects)
            object.kill()

        NetworkGameObject.list.delete(this.id)

    })

    Network.on(NetworkEvents.CLIENT_P2P_RECEIVED_DATA, function (message: any) {

        if (typeof message !== 'object') return

        createObject(message)
        newuser(message)
        updates(message)

    })

    Network.on(NetworkEvents.HOST_P2P_RECEIVED_DATA, function (message: any) {

        if (typeof message !== 'object') return

        Network.sendToAllExcept(this.id, message)

        createObject(message)
        updates(message)

    })

}


export class TransformMatrix {

    static multMat(m1: matrix, m2: matrix): matrix {

        return [

            m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5]

        ]

    }

    /**
     * Multiply the given matrix by the given Vector. Mutation safe
     * 
     * @param m1 
     * @param vec 
     * @returns 
     */
    static multVec(m1: matrix, vec: Vector): Vector {

        return new Vector(
            m1[0] * vec.x + m1[2] * vec.y + m1[4],
            m1[1] * vec.x + m1[3] * vec.y + m1[5],
            0
        )

    }

}

const getCircularReplacer = () => {

    const seen = new WeakSet()

    return (key, value) => {

        if (typeof value === 'object' && value !== null) {

            if (seen.has(value)) return

            seen.add(value)

        }

        return value
    }

}

export function badclone(o: any): any { return JSON.parse(JSON.stringify(o, getCircularReplacer())) }

export {
    Graph,
    Path,
}