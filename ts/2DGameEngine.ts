const PI2 = Math.PI * 2

const gameEngineConstructorArguments = {
    width: innerWidth,
    height: innerHeight,
    verticalPixels: 100
}

class GameEngine {

    canvas: HTMLCanvasElement = document.createElement('canvas')
    ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')
    div: HTMLDivElement = document.createElement('div')

    #width: number = 0
    #height: number = 0
    #verticalPixels: number = 0
    #ratio: number = 1

    #run: boolean = false
    #lastTime: number = Date.now()
    #dt: number = 0
    #currentScene: GameScene = null
    #nextScene: GameScene = undefined

    constructor(args = gameEngineConstructorArguments) {

        args = { ...gameEngineConstructorArguments, ...args }

        this.canvas.style.position = 'absolute'
        this.canvas.style.top = '0'
        this.canvas.style.left = '0'
        this.canvas.style.zIndex = '1'
        this.canvas.style.pointerEvents = 'none'

        this.ctx.imageSmoothingEnabled = false

        this.div.style.position = 'relative'
        this.div.appendChild(this.canvas)

        this.resize(args.width, args.height)
        this.setVerticalPixels(args.verticalPixels)

    }

    get dt() { return this.#dt }

    /**
     * update the size of both canvas
     * if a scene is curently used, update it's camera
     * 
     * @param {number} width 
     * @param {number} height 
     */
    resize(width: number, height: number): void {

        this.#width = width
        this.#height = height

        this.canvas.width = width * devicePixelRatio
        this.canvas.height = height * devicePixelRatio
        this.ctx.imageSmoothingEnabled = false
        this.canvas.style.width = width + 'px'
        this.canvas.style.height = height + 'px'

        if (this.#currentScene) {

            console.log(this.#currentScene)

            this.#currentScene.onResize(width, height)

        }

    }

    setVerticalPixels(pixels: number) {

        this.#verticalPixels = pixels

        this.#ratio = this.#height / this.#verticalPixels

    }

    /**
     * Return the div containing the redering canvas for threejs and the overlay
     * 
     * @returns {HTMLDivElement}
     */
    getDOMElement(): HTMLDivElement {

        return this.div

    }

    setScene(scene: GameScene): void {

        this.#nextScene = scene

    }

    #switchScene(): void {

        if (this.#nextScene !== undefined) {

            if (this.#currentScene)
                this.#currentScene.onUnSet()

            this.#currentScene = this.#nextScene
            this.#nextScene = undefined

            this.resize(this.#width, this.#height)

            if (this.#currentScene)
                this.#currentScene.onSet()

        }

    }

    start() {

        this.#run = true
        this.#loop()

    }

    stop() {

        this.#run = false

    }

    #loop() {

        if (!this.#run) return;

        let time: number = Date.now();
        this.#dt = (time - this.#lastTime) / 1000;
        this.#lastTime = time;
        this.#dt = Math.min(this.#dt, 0.2)
        this.ctx.fillStyle = '#000'
        this.ctx.fillRect(0, 0, this.#width, this.#height)
        this.ctx.save()
        this.ctx.translate(this.#width / 2, this.#height / 2)
        this.ctx.scale(devicePixelRatio * this.#ratio, -devicePixelRatio * this.#ratio)

        if (this.#currentScene) {

            this.#currentScene.onUpdate(this.#dt)
            this.#currentScene.onDraw(this.ctx)

        }

        this.ctx.restore()

        this.#switchScene()

        requestAnimationFrame(this.#loop.bind(this));

    }

}

class GameScene {

    tags: Map<string, GameObject[]> = new Map()

    children: GameObject[] = []
    camera: Camera = null

    constructor() {

    }

    onUpdate(dt: number) {

        if (this.update(dt))
            for (let child of reverseIterator(this.children))
                if (child instanceof GameObject)
                    child.update(dt)

    }

    onDraw(ctx: CanvasRenderingContext2D) {

        if (this.camera) {

            if (this.camera.bake)
                ctx.transform(this.camera.bake[0], this.camera.bake[1], this.camera.bake[2], this.camera.bake[3], this.camera.bake[4], this.camera.bake[5])

            else {

                let wpos = this.camera.getWorldPosition()
                let wrot = this.camera.getWorldRotation()

                ctx.translate(-wpos.x, -wpos.y)
                ctx.rotate(-wrot)
                ctx.scale(-this.camera.scale.x, -this.camera.scale.y)

            }

        }

        this.children.sort((a, b) => a.position.y - b.position.y)

        if (this.draw(ctx)) {

            for (let child of this.children)
                if (child instanceof GameObject)
                    child.onDraw(ctx)

        }

    }

    add(...object: GameObject[]): this {

        for (let obj of object) if (obj instanceof GameObject) {

            if (obj.used)
                obj.kill()

            obj.scene = this
            this.children.push(obj)

            for (let tag of obj.tags) {

                if (!this.tags.has(tag)) this.tags.set(tag, [])

                this.tags.get(tag).push(obj)

            }
        }
        return this
    }

    remove(...object: GameObject[]): this {

        for (let obj of object) {

            obj.scene = null
            this.children.splice(this.children.indexOf(obj), 1)

            for (let tag of obj.tags) {

                let list = this.tags.get(tag)

                list.splice(list.indexOf(obj), 1)

            }

        }

        return this

    }

    getTags(tag: string): GameObject[] {

        return this.tags.get(tag) ?? []

    }

    onSet(): void {

    }

    onUnSet(): void {

    }

    onResize(width: number, height: number): void {

    }

    /**
    * 
    * @param {number} dt 
    * @returns 
    */
    update(dt: number): boolean {

        return true

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns 
     */
    draw(ctx: CanvasRenderingContext2D): boolean {

        return true

    }

}

class GameObject {

    children: GameObject[] = []
    tags: string[] = []
    parent: GameObject = null
    scene: GameScene = null

    position: Vector = new Vector()
    z: number = 0
    #rotation: number = 0
    scale: Vector = new Vector(1, 1)
    bake: number[] = null

    constructor() {

    }

    get rotation() { return this.#rotation }

    set rotation(angle: number) {

        this.#rotation = ((angle % PI2) + PI2) % PI2

    }

    get used() { return this.scene !== null || this.parent !== null }

    /**
     * 
     * @param {...GameObject} object 
     * @returns 
     */
    add(...object: GameObject[]): this {

        for (let obj of object) {

            if (obj.used)
                obj.kill()

            obj.parent = this
            this.children.push(obj)

        }

        return this
    }

    /**
     * 
     * @param {...GameObject} object 
     * @returns 
     */
    remove(...object: GameObject[]): this {

        for (let obj of object) {

            obj.parent = null
            this.children.splice(this.children.indexOf(obj), 1)

        }

        return this

    }

    /**
     * 
     * @param {number} dt 
     */
    onUpdate(dt: number) {

        if (this.used && this.update(dt))
            for (let child of reverseIterator(this.children))
                if (child instanceof GameObject)
                    child.onUpdate(dt)

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    onDraw(ctx: CanvasRenderingContext2D) {

        ctx.save()

        if (this.bake)
            ctx.transform(this.bake[0], this.bake[1], this.bake[2], this.bake[3], this.bake[4], this.bake[5])

        else {

            ctx.translate(this.position.x, this.position.y + this.z)

            if (this.rotation !== 0)
                ctx.rotate(this.#rotation)

            if (!this.scale.equalS(1, 1))
                ctx.scale(this.scale.x, this.scale.y + this.z)

        }


        if (this.draw(ctx))
            for (let child of this.children)
                if (child instanceof GameObject)
                    child.onDraw(ctx)

        ctx.restore()

    }

    /**
     * 
     * @param {number} dt 
     * @returns 
     */
    update(dt: number): boolean {

        return true

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @returns 
     */
    draw(ctx: CanvasRenderingContext2D): boolean {

        return true

    }

    kill() {

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
    getWorldPosition(): Vector {

        let currentObject: GameObject = this
        let currentPosition = new Vector()

        while (currentObject) {

            if (!currentObject.scale.equalS(1, 1))
                currentPosition.mult(currentObject.scale)

            if (currentObject.rotation)
                currentPosition.rotate(currentObject.rotation)

            if (!currentObject.position.nil())
                currentPosition.add(currentObject.position)

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

            rotation += currentObject.rotation

            currentObject = currentObject.parent

        }

        return ((rotation % PI2) + PI2) % PI2

    }

    /**
     * Bake the object transformation for quicker use
     */
    bakeTransform() {

        let cos = Math.cos(this.#rotation)
        let sin = Math.sin(this.#rotation)
        let sx = this.scale.x
        let sy = this.scale.y
        let x = this.position.x
        let y = this.position.y + this.z

        this.bake = [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ]

    }

}

class Timer {

    begin: number

    constructor(time = Date.now()) {

        this.begin = time;

    }

    /**
     * Reset the timer
     */
    reset(): void {

        this.begin = new Date().getTime();

    }

    /**
     * Return the amount of time since the timer was last reset
     */
    getTime(): number {

        return new Date().getTime() - this.begin;

    }

    /**
     * Return if the time since the last reset is greather that the given amount
     * 
     * @param {number} amount 
     */
    greaterThan(amount: number): boolean {

        return this.getTime() > amount;

    }

    /**
     * Return if the time since the last reset is less that the given amount
     * 
     * @param {number} amount 
     */
    lessThan(amount: number): boolean {

        return this.getTime() < amount;

    }

}

class Input {

    keysDown: Set<string> = new Set()
    keysOnce: Set<string> = new Set()

    constructor() {

        window.addEventListener('keydown', (evt) => {

            this.keysDown.add(evt.code)
            this.keysOnce.add(evt.code)

        })

        window.addEventListener('keyup', (evt) => {

            this.keysDown.delete(evt.code)
            this.keysOnce.delete(evt.code)

        })

    }

    isDown(code: string): boolean { return this.keysDown.has(code) }

    isPressed(code: string): boolean {

        if (this.keysOnce.has(code)) {

            this.keysOnce.delete(code)

            return true

        }

        return false

    }

}

class FPSCounter extends GameObject {

    timer = new Timer()
    frameCount = 0
    fps = 0

    onUpdate(dt) {

        this.frameCount++

        if (this.timer.greaterThan(1000)) {

            this.fps = this.frameCount
            this.frameCount = 0
            this.timer.reset()

        }

        return true

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    onRender(ctx: CanvasRenderingContext2D) {

        ctx.save()

        ctx.scale(2, 2)

        ctx.fillStyle = 'red'
        ctx.textBaseline = 'top'
        ctx.fillText(this.fps.toString(), 5, 5)

        ctx.restore()

        return true

    }

}

class Camera extends GameObject {

    add(...object: GameObject[]): this { return this }

    remove(...object: GameObject[]): this { return this }

    onUpdate(dt: number): void { }

    onDraw(ctx: CanvasRenderingContext2D): void { }

    /**
     * Bake the object transformation for quicker use
     */
    bakeTransform() {

        let wpos = this.getWorldPosition()
        let wrot = this.getWorldRotation()

        let cos = Math.cos(-wrot)
        let sin = Math.sin(-wrot)
        let sx = -this.scale.x
        let sy = -this.scale.y
        let x = -wpos.x
        let y = -wpos.y

        this.bake = [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ]

    }

}

class Vector {

    x: number = 0
    y: number = 0

    constructor(x: number = 0, y: number = 0) {

        this.x = x
        this.y = y

    }

    /**
     * Set this vector values to the given values
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {this}
     */
    set(x: number, y: number): this {

        this.x = x
        this.y = y

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

        return this

    }

    /**
     * Add the given numbers to this vector
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {this}
     */
    addS(x: number = 0, y: number = 0): this {

        this.x += x
        this.y += y

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

        return this

    }

    /**
    * Sub the given numbers to this vector
    * 
    * @param {number} x 
    * @param {number} y 
    * @returns {this}
    */
    subS(x: number = 0, y: number = 0) {

        this.x -= x
        this.y -= y

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

        return this

    }

    /**
     * Return the result of the dot product between this vector and the given vector
     * 
     * @param {Vector} vector 
     * @returns {number}
     */
    dot(vector: Vector): number { return this.x * vector.x + this.y * vector.y }

    /**
     * Return the length of this vector
     * 
     * @returns {number}
     */
    length(): number { return Math.sqrt(this.x * this.x + this.y * this.y) }

    /**
     * Return true if the length of this vector is 0
     * 
     * @returns {boolean}
     */
    nil(): boolean { return this.x == 0 && this.y == 0 }

    /**
     * Normalize this vector if it is not nil
     * 
     * @returns {this}
     */
    normalize(): this {

        if (!this.nil())
            this.divS(this.length())

        return this

    }

    /**
     * Rotate the current vector of a given angle
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
     * Return the angle between this vector and the given vector
     * 
     * @param vector 
     * @returns 
     */
    angleTo(vector: Vector): number { return Math.acos(this.dot(vector) / (this.length() * vector.length())) }

    /**
     * Copy the given vector values to this vector
     * 
     * @param {Vector} vector 
     */
    copy(vector: Vector): this {

        this.x = vector.x
        this.y = vector.y

        return this

    }

    /**
     * A new instance clone of this vector
     * 
     * @returns {Vector}
     */
    clone() { return new Vector(this.x, this.y) }

    /**
     * Return true if this vector values are equal to the given vector values
     * 
     * @param {Vector} vector 
     * @returns {boolean}
     */
    equal(vector: Vector): boolean { return this.x == vector.x && this.y == vector.y }

    /**
     * Return true if this vector values are equal to the given values
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {boolean}
     */
    equalS(x: number, y: number): boolean { return this.x == x && this.y == y }

    /**
     * Convert this vector to a string
     * 
     * @returns {string}
     */
    toString() { return `Vector(${this.x}, ${this.y})` }

    /**
     * Return a new unit vector from the given angle
     * 
     * @param {number} angle 
     * @returns {Vector}
     */
    static fromAngle(angle: number): Vector { return new Vector(Math.cos(angle), Math.sin(angle)) }

}

class Rectangle {

    position: Vector = new Vector()

}

class Drawable {
}

function* reverseIterator(list: any[]) {

    list = [...list]

    for (let index = list.length - 1; index >= 0; index--)
        yield list[index]

}

class Graph {

    nodes: Set<number> = new Set()
    links: Map<number, Map<number, any>> = new Map()

    constructor() {

    }

    /**
     * 
     * @param {...number} nodes 
     */
    addNode(...nodes: number[]) {

        for (let node of nodes) {

            if (!this.nodes.has(node)) {

                this.nodes.add(node)
                this.links.set(node, new Map())

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

                this.links.delete(node)

                for (let [_, map] of this.links)
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
    addLink(...links: { source: number, target: number, data: any }[]) {

        for (let link of links) {

            this.addNode(link.source, link.target)

            this.links.get(link.source).set(link.target, link.data)

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

}




export { GameEngine, GameScene, GameObject, Timer, FPSCounter, Input, Graph, Vector, Camera }