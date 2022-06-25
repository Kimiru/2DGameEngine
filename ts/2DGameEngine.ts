const PI2 = Math.PI * 2

const gameEngineConstructorArguments = {
    width: innerWidth,
    height: innerHeight,
    verticalPixels: 100,
    scaling: 2,
    images: []
}

class GameEngine {

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
    #lock: boolean = true
    #loadedImagesCount: number = 0
    #imageToLoadCount: number = 0

    constructor(args = gameEngineConstructorArguments) {

        args = { ...gameEngineConstructorArguments, ...args }

        this.input.bindMouse(this.canvas, (vector: Vector) => {

            let sc = this.usableScale
            let half = this.usableScale.clone().divS(2)
            vector.mult(sc).sub(half)
            vector.y *= -1

            return vector

        })
        this.canvas.style.position = 'relative'
        this.canvas.style.backgroundColor = 'black'

        this.resize(args.width, args.height, args.scaling, args.verticalPixels)
        this.#imageToLoadCount = args.images.length
        this.imageBank = loadImages(args.images, (n: number) => {
            this.#loadedImagesCount = n
        }, () => {
            this.#lock = false
        })

    }


    get trueWidth(): number { return this.#trueWidth }
    get trueHeight(): number { return this.#trueHeight }
    get usableWidth(): number { return this.#usableWidth }
    get usableHeight(): number { return this.#usableHeight }
    get usableScale(): Vector { return new Vector(this.usableWidth, this.usableHeight) }

    get dt(): number { return this.#dt }

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

    setVerticalPixels(pixels: number = 1) {

        this.#verticalPixels = pixels

        this.#ratio = this.#trueHeight / this.#verticalPixels

        this.#usableHeight = this.#verticalPixels
        this.#usableWidth = this.#trueWidth / this.#ratio

    }

    setScene(scene: GameScene): void {

        this.#nextScene = scene

    }

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

    start() {

        this.#run = true
        this.#loop()

    }

    stop() {

        this.#run = false

    }

    #loop() {

        if (!this.#run) return;

        if (this.#lock) {


            this.ctx.clearRect(0, 0, this.#trueWidth, this.trueHeight)

            this.ctx.save()

            this.ctx.fillStyle = 'red'
            this.ctx.fillRect(0.1 * this.trueWidth, 0.45 * this.trueHeight, 0.8 * this.trueWidth * (this.#loadedImagesCount / this.#imageToLoadCount), 0.1 * this.trueHeight)

            this.ctx.restore()

            return requestAnimationFrame(this.#loop.bind(this));

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
    engine: GameEngine = null

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
                ctx.scale(-1 / this.camera.scale.x, -1 / this.camera.scale.y)

            }

        }

        this.children.sort((a, b) => a.zIndex != b.zIndex ? a.zIndex - b.zIndex : b.position.y - a.position.y)

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

            obj.onAdd()

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

            obj.onRemove()

        }

        return this

    }

    /**
     * 
     * @param {string} tag 
     * @returns {GameObject[]}
     */
    getTags(tag: string): GameObject[] {

        return [...(this.tags.get(tag) ?? [])]

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

    id: number = id()
    children: GameObject[] = []
    tags: string[] = []
    parent: GameObject = null
    #scene: GameScene = null

    position: Vector = new Vector()
    zIndex: number = 0
    positionRenderOffset: Vector = new Vector()
    #rotation: number = 0
    scale: Vector = new Vector(1, 1)
    bake: number[] = null

    constructor() {

    }

    /**
     * @returns {GameScene}
     */
    get scene(): GameScene { return this.#scene ?? this.parent?.scene ?? null }

    set scene(scene: GameScene) { this.#scene = scene }

    /**
     * @returns {GameEngine}
     */
    get engine() { return this.scene?.engine ?? null }

    /**
     * @returns {number}
     */
    get rotation() { return this.#rotation }

    set rotation(angle: number) {

        this.#rotation = ((angle % PI2) + PI2) % PI2

    }

    get used() { return this.scene !== null || this.parent !== null }

    get box(): Rectangle { return new Rectangle(this.position.x, this.position.y, this.scale.x, this.scale.y) }

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

            obj.onAdd()

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

            obj.onRemove()

        }

        return this

    }

    onAdd(): void { }

    onRemove(): void { }


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

            ctx.translate(this.position.x + this.positionRenderOffset.x, this.position.y + this.positionRenderOffset.y)

            if (this.rotation !== 0)
                ctx.rotate(this.#rotation)

            if (!this.scale.equalS(1, 1))
                ctx.scale(this.scale.x + this.positionRenderOffset.x, this.scale.y + this.positionRenderOffset.y)

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
    getWorldPosition(defaultPosition: Vector = new Vector()): Vector {

        let currentObject: GameObject = this
        let currentPosition = defaultPosition

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
        let x = this.position.x + this.positionRenderOffset.x
        let y = this.position.y + this.positionRenderOffset.y

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

    #keysDown: Set<string> = new Set()
    #keysOnce: Set<string> = new Set()
    #mouseButtons: [boolean, boolean, boolean] = [false, false, false]
    #mousePosition: Vector = new Vector()
    #mouseIn: boolean = false
    #mouseClickTimers: [Timer, Timer, Timer] = [new Timer(201), new Timer(201), new Timer(201)]
    positionAdapter = function (vector: Vector) { return vector }

    constructor() {

        window.addEventListener('keydown', (evt) => {

            this.#keysDown.add(evt.code)
            this.#keysOnce.add(evt.code)

        })

        window.addEventListener('keyup', (evt) => {

            this.#keysDown.delete(evt.code)
            this.#keysOnce.delete(evt.code)

        })

    }

    get mouse() {
        let result = {
            left: this.#mouseButtons[0],
            middle: this.#mouseButtons[1],
            right: this.#mouseButtons[2],
            leftClick: this.#mouseClickTimers[0].lessThan(16),
            middleClick: this.#mouseClickTimers[1].lessThan(16),
            rightClick: this.#mouseClickTimers[2].lessThan(16),
            position: this.#mousePosition.clone()
        }

        return result
    }

    isDown(code: string): boolean { return this.#keysDown.has(code) }

    isPressed(code: string): boolean {

        if (this.#keysOnce.has(code)) {

            this.#keysOnce.delete(code)

            return true

        }

        return false

    }

    bindMouse(element: HTMLElement, positionAdapter = function (vector: Vector) { return vector }) {

        this.positionAdapter = positionAdapter

        element.addEventListener('contextmenu', evt => evt.preventDefault());

        element.addEventListener('mousedown', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseup', this.#handleMouseEvent.bind(this))
        element.addEventListener('mousemove', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseleave', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseenter', this.#handleMouseEvent.bind(this))

    }

    #handleMouseEvent(evt: MouseEvent) {

        let prev: [boolean, boolean, boolean] = [this.#mouseButtons[0], this.#mouseButtons[1], this.#mouseButtons[2]]

        this.#handleButtons(evt.buttons)
        this.#mousePosition.copy(this.#to01(evt))
        this.#mouseIn = this.#mousePosition.x > 0 && this.#mousePosition.x < 1 &&
            this.#mousePosition.y > 0 && this.#mousePosition.y < 1

        for (let index = 0; index < 3; index++)
            if (this.#mouseButtons[index] == false && prev[index])
                this.#mouseClickTimers[index].reset()

    }

    #handleButtons(buttons: number) {

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

    #to01(evt: MouseEvent): Vector {

        let result = new Vector(evt.offsetX, evt.offsetY)
        let target = evt.currentTarget as HTMLCanvasElement
        result.div(new Vector(target.offsetWidth, target.offsetHeight))

        return this.positionAdapter(result)

    }

}

class FPSCounter extends GameObject {

    timer = new Timer()
    frameCount = 0
    fps = 0
    fontSize: number = 12

    constructor(fontsize: number = 10) {

        super()

        this.fontSize = fontsize

    }

    update(dt) {

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
    draw(ctx: CanvasRenderingContext2D) {


        ctx.save()

        let engine = this.engine

        ctx.translate(-engine.usableWidth / 2, engine.usableHeight / 2)

        ctx.scale(1, -1)

        ctx.font = `${this.fontSize}px sans-serif`
        ctx.fillStyle = 'red'
        ctx.textBaseline = 'top'
        ctx.fillText(this.fps.toString(), this.fontSize / 2, this.fontSize / 2)

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
        let sx = 1 / this.scale.x
        let sy = 1 / this.scale.y
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

    angle(): number {

        let vec = this.clone().normalize()
        return Math.acos(vec.x) * Math.sign(vec.y)

    }

    distanceTo(vector: Vector): number { return this.clone().sub(vector).length() }

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


function loadImages(images: { name: string, src: string }[], incrementCallback: (n: number) => void, finishedCallback: () => void): Map<string, HTMLImageElement> {

    let bank: Map<string, HTMLImageElement> = new Map()
    let completed: { n: number } = { n: 0 }

    for (let image of images) {

        let img = document.createElement('img')
        img.src = image.src

        img.onload = img.onerror = function () {

            completed.n++

            incrementCallback(completed.n)

            if (completed.n == images.length)
                finishedCallback()

        }

        bank.set(image.name, img)

    }
    return bank
}

class Rectangle extends GameObject {

    display: boolean = false
    displayColor: string = 'red'

    constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1, display: boolean = false, displayColor: string = 'red') {

        super()

        this.position.set(x, y)
        this.scale.set(w, h)

        this.display = display
        this.displayColor = displayColor

    }

    get x(): number { return this.position.x }
    set x(n: number) { this.position.x = n }
    get y(): number { return this.position.y }
    set y(n: number) { this.position.y = n }
    get w(): number { return this.scale.x }
    set w(n: number) { this.scale.x = n }
    get h(): number { return this.scale.y }
    set h(n: number) { this.scale.y = n }

    get halfW(): number { return this.scale.x / 2 }
    set halfW(n: number) { this.scale.x = n * 2 }
    get halfH(): number { return this.scale.y / 2 }
    set halfH(n: number) { this.scale.y = n * 2 }

    get left(): number { return this.position.x - this.halfW }
    set left(n: number) { this.position.x = n + this.halfW }
    get right(): number { return this.position.x + this.halfW }
    set right(n: number) { this.position.x = n - this.halfW }
    get bottom(): number { return this.position.y - this.halfH }
    set bottom(n: number) { this.position.y = n + this.halfH }
    get top(): number { return this.position.y + this.halfH }
    set top(n: number) { this.position.y = n - this.halfH }

    get topleft(): Vector { return new Vector(this.left, this.top) }
    set topleft(v: Vector) { this.left = v.x; this.top = v.y }
    get bottomleft(): Vector { return new Vector(this.left, this.bottom) }
    set bottomleft(v: Vector) { this.left = v.x; this.bottom = v.y }
    get topright(): Vector { return new Vector(this.right, this.top) }
    set topright(v: Vector) { this.right = v.x; this.top = v.y }
    get bottomright(): Vector { return new Vector(this.right, this.bottom) }
    set bottomright(v: Vector) { this.right = v.x; this.bottom = v.y }

    getPolygon(): Polygon {

        return new Polygon(this.topleft, this.bottomleft, this.bottomright, this.topright)

    }

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

}

class Polygon extends GameObject {

    points: Vector[] = []
    fill: boolean = false

    constructor(...points: Vector[]) {

        super()

        this.points = points

    }

    getSegments(): Segment[] {

        let segments = []

        if (this.points.length < 2) return segments

        for (let index = 0; index < this.points.length; index++) {
            segments.push(new Segment(this.points[index].clone(), this.points[(index + 1) % this.points.length].clone()))
        }

        return segments

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.points.length === 0) return true

        ctx.fillStyle = ctx.strokeStyle = 'yellow'
        ctx.beginPath()
        ctx.moveTo(this.points[0].x, this.points[0].y)
        for (let index = 1; index < this.points.length; index++) {
            ctx.lineTo(this.points[index].x, this.points[index].y)
        }
        ctx.lineTo(this.points[0].x, this.points[0].y)
        if (this.fill)
            ctx.fill()
        else ctx.stroke()

        return true

    }


}

class Segment extends GameObject {

    a: Vector = new Vector()
    b: Vector = new Vector()
    display: boolean = false

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
            ctx.moveTo(this.position.x + this.a.x, this.position.y + this.a.y)
            ctx.lineTo(this.position.x + this.b.x, this.position.y + this.b.y)
            ctx.stroke()
        }

        return true

    }


}

class Ray extends GameObject {

    direction: Vector = new Vector()

    constructor(position: Vector, direction: Vector) {

        super()

        this.position.copy(position)
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
                let intersectLength = this.position.distanceTo(intersect)
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
        ctx.strokeRect(-this.scale.x, -this.scale.y, this.scale.x * 2, this.scale.y * 2)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(this.direction.x * this.scale.x * 5, this.direction.y * this.scale.y * 5)
        ctx.stroke()

        return true

    }

}

class RayCastShadow extends GameObject {

    display: boolean = false

    points: [number, Vector, Vector][] = []

    constructor(display: boolean = false) {

        super()

        this.display = display

    }

    compute(segments: Segment[], infinity = 1000) {

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

        let wp = this.getWorldPosition()

        this.points = []

        for (let unique of uniques) {

            let angle = unique.clone().sub(wp).angle()

            let angle1 = angle + 0.00001
            let angle2 = angle - 0.00001

            let ray = new Ray(wp.clone(), Vector.fromAngle(angle))
            let ray1 = new Ray(wp.clone(), Vector.fromAngle(angle1))
            let ray2 = new Ray(wp.clone(), Vector.fromAngle(angle2))

            let pt = ray.cast(segments)
            let pt1 = ray1.cast(segments)
            let pt2 = ray2.cast(segments)

            this.points.push([angle, pt ?? this.position.clone().add(ray.direction.multS(infinity)), pt?.clone().sub(wp) ?? ray.direction])
            this.points.push([angle1, pt1 ?? this.position.clone().add(ray1.direction.multS(infinity)), pt1?.clone().sub(wp) ?? ray1.direction])
            this.points.push([angle2, pt2 ?? this.position.clone().add(ray2.direction.multS(infinity)), pt2?.clone().sub(wp) ?? ray2.direction])

        }

        this.points.sort((a, b) => b[0] - a[0])

    }

    enable() { this.display = true }

    disable() { this.display = false }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.display) {
            ctx.globalCompositeOperation = 'destination-in'
            let poly = new Polygon(...this.points.map(e => e[2]))
            poly.fill = true

            poly.draw(ctx)
            ctx.globalCompositeOperation = 'source-over'

        }

        return true

    }

}

class Drawable extends GameObject {

    image: HTMLImageElement = null
    size: Vector = new Vector()
    halfSize: Vector = new Vector()

    constructor(image) {

        super()

        this.image = image

        this.size.set(this.image.width, this.image.height)
        this.halfSize.copy(this.size).divS(2)

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        ctx.save()
        ctx.scale(1 / this.size.x, -1 / this.size.y)
        ctx.drawImage(this.image, -this.halfSize.x, -this.halfSize.y)

        ctx.restore()

        return true

    }

}

function* reverseIterator(list: any[]) {

    list = [...list]

    for (let index = list.length - 1; index >= 0; index--)
        yield list[index]

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

            ctx.restore()
            ctx.save()

            let positions: Map<number, Vector> = new Map()

            for (let [node, object] of this.nodesObjects) {
                positions.set(node, this.positionGetter(object))
            }

            ctx.strokeStyle = 'blue'
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

let idCount = 0
function id() { return ++idCount }

export {
    GameEngine, GameScene, GameObject,
    Timer, FPSCounter, Input, Graph, Vector,
    Camera, Rectangle, Polygon, Segment, Ray, RayCastShadow,
    Path, Drawable, id
}