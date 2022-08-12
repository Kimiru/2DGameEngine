const PI2 = Math.PI * 2;
const gameEngineConstructorArguments = {
    width: innerWidth,
    height: innerHeight,
    verticalPixels: 100,
    scaling: 2,
    images: [],
    sounds: []
};
/**
 * GameEngine is the class responsible for the execution of the game loop, the canvas and resize change, and the scene management
 */
export class GameEngine {
    canvas = document.createElement('canvas');
    ctx = this.canvas.getContext('2d');
    input = new Input();
    #width = 0;
    #height = 0;
    #trueWidth = 0;
    #trueHeight = 0;
    #verticalPixels = 1;
    #ratio = 1;
    #scaling = 1;
    #usableWidth = 0;
    #usableHeight = 0;
    #run = false;
    #lastTime = Date.now();
    #dt = 0;
    #currentScene = null;
    #nextScene = undefined;
    imageBank = new Map();
    soundBank = new Map();
    #lock0 = true;
    #lock1 = true;
    #lock2 = true;
    #loadedImagesCount = 0;
    #imageToLoadCount = 0;
    #loadedSoundCount = 0;
    #soundToLoadCount = 0;
    #ressourcesLoadedCallbacks = [];
    /**
     * Create a new game engine using the given argument list, filling the gap with default value
     *
     * @param {width: number, height: number, verticalPixels: number, scaling: number, images: Image[]} args
     */
    constructor(args = gameEngineConstructorArguments) {
        args = { ...gameEngineConstructorArguments, ...args };
        this.input.bindMouse(this.canvas, (vector) => {
            let sc = this.usableScale;
            let half = this.usableScale.clone().divS(2);
            vector.mult(sc).sub(half);
            vector.y *= -1;
            if (this.#currentScene && this.#currentScene.camera) {
                let worldTransformList = this.#currentScene.camera.getWorldTransformList();
                worldTransformList.forEach(func => func(vector));
            }
            return vector;
        });
        this.canvas.style.position = 'relative';
        this.canvas.style.backgroundColor = 'black';
        this.resize(args.width, args.height, args.scaling, args.verticalPixels);
        this.#imageToLoadCount = args.images.length;
        this.#soundToLoadCount = args.sounds.map(e => e.srcs.length).reduce((a, b) => a + b, 0);
        this.imageBank = loadImages(args.images, (n) => { this.#loadedImagesCount = n; }, () => {
            this.#lock1 = false;
            if (!this.#lock1 && !this.#lock2) {
                this.#lock0 = false;
                this.#ressourcesLoadedCallbacks.forEach(func => func.call(this));
            }
        });
        this.soundBank = loadSounds(args.sounds, (n) => { this.#loadedSoundCount = n; }, () => {
            this.#lock2 = false;
            if (!this.#lock1 && !this.#lock2) {
                this.#lock0 = false;
                this.#ressourcesLoadedCallbacks.forEach(func => func.call(this));
            }
        });
    }
    get trueWidth() { return this.#trueWidth; }
    get trueHeight() { return this.#trueHeight; }
    get usableWidth() { return this.#usableWidth; }
    get usableHeight() { return this.#usableHeight; }
    get usableScale() { return new Vector(this.usableWidth, this.usableHeight); }
    get dt() { return this.#dt; }
    get scene() { return this.#currentScene; }
    /**
     * update the size of both canvas
     * if a scene is curently used, update it's camera
     *
     * @param {number} width
     * @param {number} height
     */
    resize(width, height, scaling = this.#scaling, pixels = this.#verticalPixels) {
        this.#width = width;
        this.#height = height;
        this.#scaling = scaling;
        this.#trueWidth = width * scaling;
        this.#trueHeight = height * scaling;
        this.canvas.width = width * scaling;
        this.canvas.height = height * scaling;
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.setVerticalPixels(pixels);
        if (this.#currentScene) {
            this.#currentScene.onResize(width, height);
        }
    }
    /**
     * Set the number vertical virtual pixel.
     * i.e. if a 1x1 square is drawn, it will take 1/pixels the space
     *
     * @param {number} pixels
     */
    setVerticalPixels(pixels = 1) {
        this.#verticalPixels = pixels;
        this.#ratio = this.#trueHeight / this.#verticalPixels;
        this.#usableHeight = this.#verticalPixels;
        this.#usableWidth = this.#trueWidth / this.#ratio;
    }
    /**
     * Set the new scene to be displayed, can be null
     *
     * @param {GameScene | null} scene
     */
    setScene(scene) {
        this.#nextScene = scene;
    }
    /**
     * Effectively switch the scene to be displayed
     * Is called at then end of the gameloop
     */
    #switchScene() {
        if (this.#nextScene !== undefined) {
            if (this.#currentScene) {
                this.#currentScene.onUnSet();
                this.#currentScene.engine = null;
            }
            this.#currentScene = this.#nextScene;
            this.#nextScene = undefined;
            this.resize(this.#width, this.#height, this.#scaling);
            if (this.#currentScene) {
                this.#currentScene.onSet();
                this.#currentScene.engine = this;
            }
        }
    }
    /**
     * Start the engine, running the gameloop
     */
    start() {
        this.#run = true;
        this.#loop();
    }
    /**
     * Stop the engine, stopping the gameloop
     */
    stop() {
        this.#run = false;
    }
    /**
     * Execute the gameloop
     *
     * update -> draw -> repeat
     *
     * inputs are obtained using javascript event catcher
     *
     */
    #loop() {
        if (!this.#run)
            return;
        if (this.#lock0) {
            let value = this.#loadedImagesCount + this.#loadedSoundCount;
            let tot = this.#imageToLoadCount + this.#soundToLoadCount;
            this.ctx.clearRect(0, 0, this.#trueWidth, this.trueHeight);
            this.ctx.save();
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(0.1 * this.trueWidth, 0.45 * this.trueHeight, 0.8 * this.trueWidth * (value / tot), 0.1 * this.trueHeight);
            this.ctx.restore();
            requestAnimationFrame(this.#loop.bind(this));
            return;
        }
        let time = Date.now();
        this.#dt = (time - this.#lastTime) / 1000;
        this.#lastTime = time;
        this.#dt = Math.min(this.#dt, 0.2);
        this.ctx.clearRect(0, 0, this.#trueWidth, this.trueHeight);
        this.ctx.save();
        this.ctx.translate(this.trueWidth / 2, this.trueHeight / 2);
        this.ctx.scale(this.#ratio, -this.#ratio);
        if (this.#currentScene) {
            this.#currentScene.executeUpdate(this.#dt);
            this.#currentScene.executePhysics(this.#dt);
            this.#currentScene.executeDraw(this.ctx);
            if (window.Peer)
                if (NetworkGameObject.hasPendingUpdates())
                    NetworkGameObject.flushPendingUpdates();
        }
        this.ctx.restore();
        this.input.mouseLoop();
        this.#switchScene();
        requestAnimationFrame(this.#loop.bind(this));
    }
    onResourcesLoaded(callback) {
        if (this.#lock0) {
            this.#ressourcesLoadedCallbacks.push(callback);
        }
        else
            callback.call(this);
    }
}
/**
 * GameScene is the class responsible for all the scene related operation such as camera definition, object adding, object grouping, scene update and rendering.
 * GameScene id is not used for scene unicity but for scene sorting regarding Network.
 * If you need multiple instance of the same scene, make sure ids are different but deterministic.
 * The deteministic side is needed when working with the Network
 * It is recommended to instanciate all your scene at the beginning if possible
 */
export class GameScene {
    static list = new Map();
    id = 'GameScene';
    tags = new Map();
    children = [];
    camera = null;
    engine = null;
    /**
     * Create a new empty GameScene
     */
    constructor() {
    }
    store() { GameScene.list.set(this.id, this); }
    /**
     * Update the scene and its child
     * Is called by the GameEngine to update the scene
     * Should not be called by the user
     *
     * @param {number} dt
     */
    executeUpdate(dt) {
        this.update(dt);
        for (let child of [...this.children])
            if (child instanceof GameObject)
                child.executeUpdate(dt);
    }
    executePhysics(dt) {
        this.physics(dt);
        for (let child of [...this.children])
            if (child instanceof GameObject)
                child.executePhysics(dt);
    }
    /**
     * Draw the scene and its child
     * Is called by the GameEngine to draw the scene
     * Should not be called by the user
     *
     * @param ctx
     */
    executeDraw(ctx) {
        if (this.camera) {
            if (this.camera.bake)
                ctx.transform(this.camera.bake[0], this.camera.bake[1], this.camera.bake[2], this.camera.bake[3], this.camera.bake[4], this.camera.bake[5]);
            else {
                let wpos = this.camera.getWorldPosition();
                let wrot = this.camera.getWorldRotation();
                ctx.translate(-wpos.x, -wpos.y);
                ctx.rotate(-wrot);
                ctx.scale(1 / this.camera.scale.x, 1 / this.camera.scale.y);
            }
        }
        this.children.sort((a, b) => a.zIndex != b.zIndex ? a.zIndex - b.zIndex : b.position.y - a.position.y);
        this.draw(ctx);
        for (let child of this.children)
            if (child instanceof GameObject)
                child.executeDraw(ctx);
    }
    /**
     * Add one or more object to the scene sorting them out by their tages, removing them from previous parent/scene if needed
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    add(...object) {
        for (let obj of object)
            if (obj instanceof GameObject) {
                if (obj.used)
                    obj.kill();
                obj.scene = this;
                this.children.push(obj);
                this.addTags(obj);
                obj.onAdd();
            }
        return this;
    }
    /**
     * Sort the given objects and their children by their tags
     * Should not be called by the user
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    addTags(...object) {
        for (let obj of object)
            if (obj instanceof GameObject) {
                for (let tag of obj.tags) {
                    if (!this.tags.has(tag))
                        this.tags.set(tag, []);
                    this.tags.get(tag).push(obj);
                }
                this.addTags(...obj.children);
            }
        return this;
    }
    /**
     * Remove one or more from the scene, object should be in the scene
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    remove(...object) {
        for (let obj of object)
            if (obj instanceof GameObject) {
                let index = this.children.indexOf(obj);
                if (index !== -1) {
                    this.removeTags(obj);
                    obj.scene = null;
                    this.children.splice(index, 1);
                    obj.onRemove();
                }
            }
        return this;
    }
    /**
     * Remove the given objects and their children from the tag sorting lists
     * Should not be called by the user
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    removeTags(...object) {
        for (let obj of object)
            if (obj instanceof GameObject) {
                for (let tag of obj.tags) {
                    let list = this.tags.get(tag);
                    let index = list.indexOf(obj);
                    if (index !== -1)
                        list.splice(index, 1);
                }
                this.removeTags(...obj.children);
            }
        return this;
    }
    /**
     * Get an immutable array of all the object using the given tag
     *
     * @param {string} tag
     * @returns {GameObject[]}
     */
    getTags(tag) {
        return [...(this.tags.get(tag) ?? [])];
    }
    /**
     * Is called when the scene is set to a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onSet() {
    }
    /**
     * Is called when the scene is unset from a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onUnSet() {
    }
    /**
     * Is called when the canvas viewport changes when used by a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} width
     * @param {number} height
     */
    onResize(width, height) {
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
    update(dt) { }
    /**
     * Update the scene physics specific operation
     *
     * Is called when the scene physics is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    physics(dt) { }
    /**
     * Draw the scene specific element
     *
     * Is called when the scene is drawn
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) { }
}
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
    position = new Vector();
    zIndex = 0;
    #rotation = 0;
    scale = new Vector(1, 1);
    bake = null;
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
     * Return the rotation of the object
     *
     * @returns {number}
     */
    get rotation() { return this.#rotation; }
    /**
     * Set the rotation of the object
     * The angle is automatically converted into modulo 2.PI > 0
     *
     * @param {number} angle
     */
    set rotation(angle) {
        this.#rotation = ((angle % PI2) + PI2) % PI2;
    }
    /**
     * Return true if object is either in a scene or has a parent object
     */
    get used() { return this.scene !== null || this.parent !== null; }
    get box() { return new Rectangle(this.position.x, this.position.y, this.scale.x, this.scale.y); }
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
            if (index !== 1)
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
    /**
    * Draw the object and its child.
    * Is called by the Scene or parent objects to draw this object.
    * Should not be called by the user.
    *
    * @param {number} dt
    */
    executeDraw(ctx) {
        ctx.save();
        if (this.bake)
            ctx.transform(this.bake[0], this.bake[1], this.bake[2], this.bake[3], this.bake[4], this.bake[5]);
        else {
            ctx.translate(this.position.x, this.position.y);
            if (this.rotation !== 0)
                ctx.rotate(this.#rotation);
            if (!this.scale.equalS(1, 1))
                ctx.scale(this.scale.x, this.scale.y);
        }
        if (this.#drawBeforeChild && this.drawEnabled)
            this.draw(ctx);
        if (this.childrenDrawEnabled)
            for (let child of this.children)
                if (child instanceof GameObject)
                    child.executeDraw(ctx);
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
            if (!currentObject.scale.equalS(1, 1))
                currentPosition.mult(currentObject.scale);
            if (currentObject.rotation)
                currentPosition.rotate(currentObject.rotation);
            if (!currentObject.position.nil())
                currentPosition.add(currentObject.position);
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
            rotation += currentObject.rotation;
            currentObject = currentObject.parent;
        }
        return ((rotation % PI2) + PI2) % PI2;
    }
    getWorldTransformList() {
        let list = [];
        let currentObject = this;
        while (currentObject) {
            if (!currentObject.scale.equalS(1, 1)) {
                let scale = currentObject.scale.clone();
                list.push((vec) => { vec.mult(scale); });
            }
            if (currentObject.rotation) {
                let rotation = currentObject.rotation;
                list.push((vec) => { vec.rotate(rotation); });
            }
            if (!currentObject.position.nil()) {
                let position = currentObject.position.clone();
                list.push((vec) => { vec.add(position); });
            }
            currentObject = currentObject.parent;
        }
        return list;
    }
    /**
     * Bake the object transformation for quicker use
     */
    bakeTransform() {
        let cos = Math.cos(this.#rotation);
        let sin = Math.sin(this.#rotation);
        let sx = this.scale.x;
        let sy = this.scale.y;
        let x = this.position.x;
        let y = this.position.y;
        this.bake = [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ];
    }
}
/**
 * The Timer class is used to mesure time easily
 */
export class Timer {
    begin;
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
    reset() {
        this.begin = Date.now();
    }
    /**
     * Return the amount of time in ms since the timer was last reset
     */
    getTime() {
        return Date.now() - this.begin;
    }
    /**
     * Return true if the time since the last reset is greather that the given amount in ms
     *
     * @param {number} amount in ms
     */
    greaterThan(amount) {
        return this.getTime() > amount;
    }
    /**
     * Return true if the time since the last reset is less that the given amount in ms
     *
     * @param {number} amount
     */
    lessThan(amount) {
        return this.getTime() < amount;
    }
}
/**
 * The Input class is used to register keyboard input, and mouse input if linked to an element
 */
export class Input {
    #keysDown = new Set();
    #keysOnce = new Set();
    #mouseButtons = [false, false, false];
    #mousePosition = new Vector();
    #mouseIn = false;
    #mouseClick = [false, false, false];
    positionAdapter = function (vector) { return vector; };
    constructor() {
        window.addEventListener('keydown', (evt) => {
            this.#keysDown.add(evt.code);
            this.#keysOnce.add(evt.code);
        });
        window.addEventListener('keyup', (evt) => {
            this.#keysDown.delete(evt.code);
            this.#keysOnce.delete(evt.code);
        });
    }
    /**
     * Returns an instant of the mouse, click field if true will be available for one frame only
     */
    get mouse() {
        let result = {
            left: this.#mouseButtons[0],
            middle: this.#mouseButtons[1],
            right: this.#mouseButtons[2],
            leftClick: this.#mouseClick[0],
            middleClick: this.#mouseClick[1],
            rightClick: this.#mouseClick[2],
            position: this.#mousePosition.clone(),
            in: this.#mouseIn
        };
        return result;
    }
    /**
     * Return true if the given key is down
     *
     * @param {string} code
     * @returns {boolean}
     */
    isDown(code) { return this.#keysDown.has(code); }
    /**
     * return true once if the given key is down, must be repressed to return true again
     *
     * @param {string} code
     * @returns {boolean}
     */
    isPressed(code) {
        if (this.#keysOnce.has(code)) {
            this.#keysOnce.delete(code);
            return true;
        }
        return false;
    }
    /**
     * Bind the input object to an html element, a position adapter function can be passed to convert the 0 to 1 default output to a preferable unit
     *
     * @param {HTMLElement} element
     * @param {(vector:Vector)=>Vector} positionAdapter
     */
    bindMouse(element, positionAdapter = function (vector) { return vector; }) {
        this.positionAdapter = positionAdapter;
        element.addEventListener('contextmenu', evt => evt.preventDefault());
        element.addEventListener('mousedown', this.#handleMouseEvent.bind(this));
        element.addEventListener('mouseup', this.#handleMouseEvent.bind(this));
        element.addEventListener('mousemove', this.#handleMouseEvent.bind(this));
        element.addEventListener('mouseleave', this.#handleMouseEvent.bind(this));
        element.addEventListener('mouseenter', this.#handleMouseEvent.bind(this));
    }
    mouseLoop() {
        for (let index = 0; index < 3; index++)
            this.#mouseClick[index] = false;
    }
    /**
     * Handle the mouse related operations
     *
     * @param {MouseEvent} evt
     */
    #handleMouseEvent(evt) {
        let prev = [this.#mouseButtons[0], this.#mouseButtons[1], this.#mouseButtons[2]];
        this.#handleButtons(evt.buttons);
        this.#mousePosition.copy(this.#to01(evt));
        this.#mouseIn = this.#mousePosition.x > 0 && this.#mousePosition.x < 1 &&
            this.#mousePosition.y > 0 && this.#mousePosition.y < 1;
        for (let index = 0; index < 3; index++)
            if (!this.#mouseButtons[index] && prev[index])
                this.#mouseClick[index] = true;
    }
    /**
     * Convert the buttons input number to the adapted button boolean
     *
     * @param buttons
     */
    #handleButtons(buttons) {
        switch (buttons) {
            case 1:
            case 3:
            case 5:
            case 7:
                this.#mouseButtons[0] = true;
                break;
            default:
                this.#mouseButtons[0] = false;
                break;
        }
        switch (buttons) {
            case 4:
            case 5:
            case 6:
            case 7:
                this.#mouseButtons[1] = true;
                break;
            default:
                this.#mouseButtons[1] = false;
                break;
        }
        switch (buttons) {
            case 2:
            case 3:
            case 6:
            case 7:
                this.#mouseButtons[2] = true;
                break;
            default:
                this.#mouseButtons[2] = false;
                break;
        }
    }
    /**
     * convert the position from the html element size to the 0-1 scale
     *
     * @param evt
     * @returns
     */
    #to01(evt) {
        let result = new Vector(evt.offsetX, evt.offsetY);
        let target = evt.currentTarget;
        result.div(new Vector(target.offsetWidth, target.offsetHeight));
        return this.positionAdapter(result);
    }
}
/**
 * The FPSCounter class is, as its name says, used to display the number of FPS of the game on the top left corner of the screen in a given font size
 */
export class FPSCounter extends GameObject {
    timer = new Timer();
    frameCount = 0;
    fps = 0;
    fontSize = 12;
    /**
     * Create a new FPSCounter with a given font size
     *
     * @param fontsize
     */
    constructor(fontsize = 10) {
        super();
        this.fontSize = fontsize;
    }
    /**
     * Update the timer
     * Should not be called by the user
     *
     * @param {number} dt
     * @returns {boolean}
     */
    update(dt) {
        this.frameCount++;
        if (this.timer.greaterThan(1000)) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.timer.reset();
        }
        return true;
    }
    /**
     * Draw the timer on the top left corner
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     * @return {boolean}
     */
    draw(ctx) {
        ctx.save();
        let engine = this.engine;
        ctx.translate(-engine.usableWidth / 2, engine.usableHeight / 2);
        ctx.scale(1, -1);
        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.fillStyle = 'red';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.fps.toString(), this.fontSize / 2, this.fontSize / 2);
        ctx.restore();
        return true;
    }
}
export class MouseCursor extends GameObject {
    constructor() {
        super();
    }
    update(dt) {
        let mouse = this.scene.engine.input.mouse;
        this.position.copy(mouse.position);
    }
    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -5);
        ctx.lineTo(4, -4);
        ctx.lineTo(0, 0);
        ctx.fill();
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
        super();
        this.updateEnabled = false;
        this.physicsEnabled = false;
        this.drawEnabled = false;
        this.childrenUpdateEnabled = false;
        this.childrenPhysicsEnabled = false;
        this.childrenDrawEnabled = false;
    }
    /**
     * This function has been disabled for this object in particular
     * You cannot add children to this object
     *
     * @param {number} dt
     */
    add(...object) { return this; }
    /**
     * This function has been disabled for this object in particular
     *
     * @param {number} dt
     */
    remove(...object) { return this; }
    /**
     * Bake the object transformation for quicker use
     */
    bakeTransform() {
        let wpos = this.getWorldPosition();
        let wrot = this.getWorldRotation();
        let cos = Math.cos(-wrot);
        let sin = Math.sin(-wrot);
        let sx = 1 / this.scale.x;
        let sy = 1 / this.scale.y;
        let x = -wpos.x;
        let y = -wpos.y;
        this.bake = [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ];
    }
}
/**
 * class Vector represent a 3 dimentional vector
 * it also contains function that are used in 2d context for practical purposes
 */
export class Vector {
    x = 0;
    y = 0;
    z = 0;
    /**
     * Create a new 3D Vector
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
    * Set this vector values to the given values
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {this}
    */
    set(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    /**
     * Add the given vector to this vector
     *
     * @param {Vector} vector
     * @returns {this}
     */
    add(vector = new Vector()) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }
    /**
     * Add the given numbers to this vector
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {this}
     */
    addS(x = 0, y = 0, z = 0) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }
    /**
     * Sub the given vector to this vector
     *
     * @param {Vector} vector
     * @returns {this}
     */
    sub(vector = new Vector()) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }
    /**
    * Sub the given numbers to this vector
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {this}
    */
    subS(x = 0, y = 0, z = 0) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }
    /**
     * Multiply each of this vector value by each of the given vector value
     *
     * @param {Vector} vector
     * @returns {this}
     */
    mult(vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        return this;
    }
    /**
     * Multiply this vector by a given value
     *
     * @param {number} n
     * @returns {this}
     */
    multS(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }
    /**
    * Divide each of this vector value by each of the given vector value
    *
    * @param {Vector} vector
    * @returns {this}
    */
    div(vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        return this;
    }
    /**
     * Divide this vector by a given value
     *
     * @param {number} n
     * @returns {this}
     */
    divS(n) {
        this.x /= n;
        this.y /= n;
        this.z /= n;
        return this;
    }
    /**
     * Returns the result of the dot product between this vector and the given vector
     *
     * @param {Vector} vector
     * @returns {number}
     */
    dot(vector) { return this.x * vector.x + this.y * vector.y + this.z * vector.z; }
    /**
     * Returns the length of this vector
     *
     * @returns {number}
     */
    length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    /**
     * Returns true if the length of this vector is 0
     *
     * @returns {boolean}
     */
    nil() { return this.x == 0 && this.y == 0 && this.z == 0; }
    /**
     * Normalizes this vector if it is not nil
     *
     * @returns {this}
     */
    normalize() {
        if (!this.nil())
            this.divS(this.length());
        return this;
    }
    /**
     * Rotates the current vector of a given angle on the x and y values
     *
     * @param {number} angle
     * @returns {this}
     */
    rotate(angle) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let x = cos * this.x - sin * this.y;
        let y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    }
    /**
     * Rotate the current vector of a given angle arround a given position on the x and y values
     *
     * @param {Vector} position
     * @param {number} angle
     * @returns {this}
     */
    rotateAround(position, angle) {
        this.sub(position);
        this.rotate(angle);
        this.add(position);
        return this;
    }
    /**
     * Returns the angle between this vector and the given vector
     *
     * @param vector
     * @returns {number}
     */
    angleTo(vector) { return Math.acos(this.dot(vector) / (this.length() * vector.length())); }
    /**
     * Returns the angle on this vector on plane x, y
     *
     * @returns {number}
     */
    angle() {
        let vec = this.clone().normalize();
        return Math.acos(vec.x) * Math.sign(vec.y);
    }
    /**
     * Returns the distance from this Vector position to the given Vector position
     *
     * @param {Vector} vector
     * @returns {number}
     */
    distanceTo(vector) { return this.clone().sub(vector).length(); }
    /**
     * Copy the given vector values to this vector
     *
     * @param {Vector} vector
     */
    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        return this;
    }
    /**
     * A new instance clone of this vector
     *
     * @returns {Vector}
     */
    clone() { return new Vector(this.x, this.y, this.z); }
    /**
     * Returns true if this vector values are equal to the given vector values
     *
     * @param {Vector} vector
     * @returns {boolean}
     */
    equal(vector) { return this.x == vector.x && this.y == vector.y && this.z == vector.z; }
    /**
     * Returns true if this vector values are equal to the given values
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    equalS(x = 0, y = 0, z = 0) { return this.x == x && this.y == y && this.z == z; }
    /**
     * Converts this vector to a string
     *
     * @returns {string}
     */
    toString() { return `Vector(${this.x}, ${this.y}, ${this.z})`; }
    /**
     * Returns a new unit vector from the given angle
     *
     * @param {number} angle
     * @returns {Vector}
     */
    static fromAngle(angle) { return new Vector(Math.cos(angle), Math.sin(angle)); }
}
export class PositionIntegrator {
    previousPosition = new Vector();
    position = new Vector();
    velocity = new Vector();
    acceleration = new Vector();
    constructor() { }
    integrate(t) {
        let tt = t * t;
        this.previousPosition.copy(this.position);
        this.position
            .add(this.velocity.clone().multS(t))
            .add(this.acceleration.clone().multS(tt * 1 / 2));
        this.velocity.add(this.acceleration.clone().multS(t));
    }
}
/**
 * loads multiple images and use callbacks for progression checks and at the end
 *
 * @param {{ name: string, src: string }[]} images
 * @param {(completed:number) => void} incrementCallback
 * @param {() => void}finishedCallback
 * @returns
 */
export function loadImages(images, incrementCallback, finishedCallback) {
    let bank = new Map();
    let completed = { n: 0 };
    for (let image of images) {
        let img = document.createElement('img');
        img.src = image.src;
        img.onload = img.onerror = function () {
            completed.n++;
            incrementCallback(completed.n);
            if (completed.n == images.length)
                finishedCallback();
        };
        bank.set(image.name, img);
    }
    if (images.length === 0)
        finishedCallback();
    return bank;
}
class Sound {
    sounds = [];
    volume = 1;
    currentSound = null;
    constructor(sounds) {
        this.sounds = sounds;
    }
    play() {
        let sound = this.sounds[Math.floor(Math.random() * this.sounds.length)];
        sound.volume = this.volume;
        if (this.currentSound)
            this.currentSound.pause();
        this.currentSound = sound;
        this.currentSound.currentTime = 0;
        this.currentSound.play();
    }
    setVolume(volume) { this.volume = volume; }
}
export function loadSounds(sounds, incrementCallback, finishedCallback) {
    let bank = new Map();
    let completed = { n: 0 };
    let toComplete = { n: 0 };
    for (let sound of sounds) {
        let snds = [];
        for (let src of sound.srcs) {
            toComplete.n++;
            let snd = document.createElement('audio');
            snd.src = src;
            snd.oncanplay = snd.onerror = function () {
                completed.n++;
                incrementCallback(completed.n);
                if (completed.n == toComplete.n)
                    finishedCallback();
            };
            snds.push(snd);
        }
        bank.set(sound.name, new Sound(snds));
    }
    if (completed.n == toComplete.n)
        finishedCallback();
    return bank;
}
/**
 * The Polygon represent a N point polygon
 * To work properly, it needs at least 3 point to close
 */
export class Polygon extends GameObject {
    #points = [];
    fill = false;
    /**
     * Create a new polygon using the given points
     *
     * @param points
     */
    constructor(...points) {
        super();
        this.points = points;
    }
    get points() { return [...this.#points]; }
    set points(pts) { this.#points = pts; }
    get worldPoints() {
        let worldTransformList = this.getWorldTransformList();
        let points = this.points;
        worldTransformList.forEach(points.forEach.bind(points));
        return points;
    }
    /**
     * Get the list of segments between the points in order
     * Returns an empty list if there is only one point
     *
     * @returns {Segment[]}
     */
    getSegments() {
        let segments = [];
        let points = this.points;
        if (points.length < 2)
            return segments;
        for (let index = 0; index < points.length; index++) {
            segments.push(new Segment(points[index].clone(), points[(index + 1) % points.length].clone()));
        }
        return segments;
    }
    getWorldSegment() {
        let segments = [];
        let points = this.worldPoints;
        if (points.length < 2)
            return segments;
        for (let index = 0; index < points.length; index++) {
            segments.push(new Segment(points[index].clone(), points[(index + 1) % points.length].clone()));
        }
        return segments;
    }
    /**
     * Draw the polygon
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     * @returns {boolean}
     */
    draw(ctx) {
        if (this.points.length === 0)
            return true;
        ctx.fillStyle = ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let index = 1; index < this.points.length; index++) {
            ctx.lineTo(this.points[index].x, this.points[index].y);
        }
        ctx.lineTo(this.points[0].x, this.points[0].y);
        if (this.fill)
            ctx.fill();
        else
            ctx.stroke();
        return true;
    }
    containsVector(vector) {
        let segments = this.getSegments();
        let count = 0;
        let ray = new Ray(vector, new Vector(1, 0));
        for (let segment of segments)
            if (ray.intersect(segment))
                count++;
        return (count % 2) === 1;
    }
    containsWorldVector(vector) {
        let segments = this.getWorldSegment();
        let count = 0;
        let ray = new Ray(vector, new Vector(1, 0));
        for (let segment of segments)
            if (ray.intersect(segment))
                count++;
        return (count % 2) === 1;
    }
}
/**
 *
 */
export class Rectangle extends Polygon {
    display = false;
    displayColor = 'red';
    #ptmem = [new Vector(), new Vector()];
    constructor(x = 0, y = 0, w = 1, h = 1, display = false, displayColor = 'red') {
        super();
        this.position.set(x, y);
        this.scale.set(w, h);
        this.#ptmem[0].copy(this.position);
        this.#ptmem[1].copy(this.scale);
        super.points = [];
        this.display = display;
        this.displayColor = displayColor;
    }
    get points() {
        if (super.points.length === 0 || !this.#ptmem[0].equal(this.position) || !this.#ptmem[1].equal(this.scale)) {
            super.points = [this.topleft, this.bottomleft, this.bottomright, this.topright];
            this.#ptmem[0].copy(this.position);
            this.#ptmem[1].copy(this.position);
        }
        return super.points;
    }
    set points(vecs) { }
    get worldPoints() {
        let worldTransformList = this.getWorldTransformList();
        let points = [new Vector(-.5, .5), new Vector(-.5, -.5), new Vector(.5, -.5), new Vector(.5, .5)];
        worldTransformList.forEach(points.forEach.bind(points));
        return points;
    }
    get x() { return this.position.x; }
    set x(n) { this.position.x = n; }
    get y() { return this.position.y; }
    set y(n) { this.position.y = n; }
    get w() { return this.scale.x; }
    set w(n) { this.scale.x = n; }
    get h() { return this.scale.y; }
    set h(n) { this.scale.y = n; }
    get halfW() { return this.scale.x / 2; }
    set halfW(n) { this.scale.x = n * 2; }
    get halfH() { return this.scale.y / 2; }
    set halfH(n) { this.scale.y = n * 2; }
    get left() { return this.position.x - this.halfW; }
    set left(n) { this.position.x = n + this.halfW; }
    get right() { return this.position.x + this.halfW; }
    set right(n) { this.position.x = n - this.halfW; }
    get bottom() { return this.position.y - this.halfH; }
    set bottom(n) { this.position.y = n + this.halfH; }
    get top() { return this.position.y + this.halfH; }
    set top(n) { this.position.y = n - this.halfH; }
    get topleft() { return new Vector(this.left, this.top); }
    set topleft(v) { this.left = v.x; this.top = v.y; }
    get bottomleft() { return new Vector(this.left, this.bottom); }
    set bottomleft(v) { this.left = v.x; this.bottom = v.y; }
    get topright() { return new Vector(this.right, this.top); }
    set topright(v) { this.right = v.x; this.top = v.y; }
    get bottomright() { return new Vector(this.right, this.bottom); }
    set bottomright(v) { this.right = v.x; this.bottom = v.y; }
    contains(vector) { return vector.x <= this.right && vector.x >= this.left && vector.y <= this.top && vector.y >= this.bottom; }
    collide(rect) {
        return this.left < rect.right &&
            rect.left < this.right &&
            this.bottom < rect.top &&
            rect.bottom < this.top;
    }
    draw(ctx) {
        if (this.display) {
            ctx.save();
            ctx.scale(1 / this.w, 1 / this.h);
            ctx.strokeStyle = this.displayColor;
            ctx.strokeRect(this.left, this.bottom, this.w, this.h);
            ctx.fillStyle = this.displayColor;
            ctx.fillRect(-1, -1, 2, 2);
            ctx.restore();
        }
        return true;
    }
}
export class Segment extends GameObject {
    a = new Vector();
    b = new Vector();
    display = false;
    constructor(a, b, display = false) {
        super();
        this.a = a;
        this.b = b;
        this.display = display;
    }
    intersect(segment) {
        let seg1a = segment.getWorldPosition(segment.a.clone());
        let seg1b = segment.getWorldPosition(segment.b.clone());
        let seg2a = this.getWorldPosition(this.a.clone());
        let seg2b = this.getWorldPosition(this.b.clone());
        let x1 = seg1a.x;
        let y1 = seg1a.y;
        let x2 = seg1b.x;
        let y2 = seg1b.y;
        let x3 = seg2a.x;
        let y3 = seg2a.y;
        let x4 = seg2b.x;
        let y4 = seg2b.y;
        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denum === 0)
            return null;
        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum;
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum;
        if (t < 0 || t > 1 || u < 0 || u > 1)
            return null;
        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
    draw(ctx) {
        if (this.display) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(this.position.x + this.a.x, this.position.y + this.a.y);
            ctx.lineTo(this.position.x + this.b.x, this.position.y + this.b.y);
            ctx.stroke();
        }
        return true;
    }
}
export class Ray extends GameObject {
    direction = new Vector();
    constructor(position, direction) {
        super();
        this.position.copy(position);
        this.direction = direction;
    }
    intersect(segment) {
        let sega = segment.getWorldPosition(segment.a.clone());
        let segb = segment.getWorldPosition(segment.b.clone());
        let wp = this.getWorldPosition();
        let wpdir = this.getWorldPosition(this.direction.clone().normalize());
        let x1 = sega.x;
        let y1 = sega.y;
        let x2 = segb.x;
        let y2 = segb.y;
        let x3 = wp.x;
        let y3 = wp.y;
        let x4 = wpdir.x;
        let y4 = wpdir.y;
        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denum === 0)
            return null;
        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum;
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum;
        if (t < 0 || t > 1 || u < 0)
            return null;
        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
    cast(segments) {
        let result = null;
        let length = 0;
        for (let segment of segments) {
            let intersect = this.intersect(segment);
            if (intersect) {
                let intersectLength = this.position.distanceTo(intersect);
                if (result === null || intersectLength < length) {
                    result = intersect;
                    length = intersectLength;
                }
            }
        }
        return result;
    }
    draw(ctx) {
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(-this.scale.x, -this.scale.y, this.scale.x * 2, this.scale.y * 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.direction.x * this.scale.x * 5, this.direction.y * this.scale.y * 5);
        ctx.stroke();
        return true;
    }
}
export class RayCastShadow extends GameObject {
    display = false;
    points = [];
    constructor(display = false) {
        super();
        this.display = display;
    }
    compute(segments, infinity = 1000) {
        let uniques = [
            Vector.fromAngle(Math.PI / 4).multS(infinity),
            Vector.fromAngle(Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI / 4).multS(infinity)
        ];
        for (let segment of segments) {
            let sega = segment.getWorldPosition(segment.a.clone());
            let segb = segment.getWorldPosition(segment.b.clone());
            if (!uniques.some(pt => pt.equal(sega)))
                uniques.push(sega);
            if (!uniques.some(pt => pt.equal(segb)))
                uniques.push(segb);
        }
        let wp = this.getWorldPosition();
        this.points = [];
        for (let unique of uniques) {
            let angle = unique.clone().sub(wp).angle();
            let angle1 = angle + 0.00001;
            let angle2 = angle - 0.00001;
            let ray = new Ray(wp.clone(), Vector.fromAngle(angle));
            let ray1 = new Ray(wp.clone(), Vector.fromAngle(angle1));
            let ray2 = new Ray(wp.clone(), Vector.fromAngle(angle2));
            let pt = ray.cast(segments);
            let pt1 = ray1.cast(segments);
            let pt2 = ray2.cast(segments);
            this.points.push([angle, pt ?? this.position.clone().add(ray.direction.multS(infinity)), pt?.clone().sub(wp) ?? ray.direction]);
            this.points.push([angle1, pt1 ?? this.position.clone().add(ray1.direction.multS(infinity)), pt1?.clone().sub(wp) ?? ray1.direction]);
            this.points.push([angle2, pt2 ?? this.position.clone().add(ray2.direction.multS(infinity)), pt2?.clone().sub(wp) ?? ray2.direction]);
        }
        this.points.sort((a, b) => b[0] - a[0]);
    }
    enable() { this.display = true; }
    disable() { this.display = false; }
    draw(ctx) {
        if (this.display) {
            ctx.globalCompositeOperation = 'destination-in';
            let poly = new Polygon(...this.points.map(e => e[2]));
            poly.fill = true;
            poly.draw(ctx);
            ctx.globalCompositeOperation = 'source-over';
        }
        return true;
    }
}
export class Drawable extends GameObject {
    image = null;
    size = new Vector();
    halfSize = new Vector();
    constructor(image) {
        super();
        this.image = image;
        this.size.set(this.image.width, this.image.height);
        this.halfSize.copy(this.size).divS(2);
    }
    draw(ctx) {
        ctx.save();
        ctx.scale(1 / this.size.x, -1 / this.size.y);
        ctx.drawImage(this.image, -this.halfSize.x, -this.halfSize.y);
        ctx.restore();
        return true;
    }
}
export class TextBox extends GameObject {
    text = '';
    active = false;
    rect = new Rectangle(0, 0, 1, 1);
    fontSize;
    font;
    width;
    color = 'white';
    onSound;
    offSound;
    placeholder = '';
    constructor(fontSize, width, font = 'sans-serif', color = 'black', onSound = null, offSound = null) {
        super();
        this.fontSize = fontSize;
        this.font = font;
        this.width = width;
        this.color = color;
        this.onSound = onSound;
        this.offSound = offSound;
        this.rect.scale.set(width + 4, fontSize + 4);
        this.add(this.rect);
        window.addEventListener('keydown', async (event) => {
            if (this.active) {
                if (event.code === 'KeyV' && event.ctrlKey)
                    this.text += await navigator.clipboard.readText();
                else if (event.key.length === 1)
                    this.text += event.key;
                else if (event.key === 'Backspace')
                    this.text = this.text.slice(0, -1);
                else if (event.key === 'Enter') {
                    this.rect.displayColor = 'red';
                    this.active = false;
                    if (this.offSound)
                        this.engine.soundBank.get(this.offSound)?.play();
                }
            }
        });
        this.drawAfterChildren();
    }
    update(dt) {
        let mouse = this.input.mouse;
        if (mouse.leftClick) {
            if (this.rect.containsWorldVector(mouse.position)) {
                if (!this.active) {
                    this.rect.displayColor = 'blue';
                    this.active = true;
                    if (this.onSound)
                        this.engine.soundBank.get(this.onSound)?.play();
                }
            }
            else {
                if (this.active) {
                    this.rect.displayColor = 'red';
                    this.active = false;
                    if (this.offSound)
                        this.engine.soundBank.get(this.offSound)?.play();
                }
            }
        }
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(-this.width / 2, 0);
        ctx.scale(1, -1);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.fillStyle = this.color;
        let txt = this.text + (this.active ? '_' : '');
        if (txt.length === 0)
            txt = this.placeholder;
        ctx.fillText(txt, 0, 0, this.width);
        ctx.restore();
    }
}
export class Button extends GameObject {
    text = '';
    #active = new Timer(0);
    rect = new Rectangle(0, 0, 1, 1);
    get active() { return this.#active.lessThan(150); }
    fontSize;
    font;
    width;
    color = 'white';
    activeColor = 'gray';
    onSound;
    constructor(fontSize, width, font = 'sans-serif', color = 'black', onSound = null) {
        super();
        this.fontSize = fontSize;
        this.font = font;
        this.width = width;
        this.color = color;
        this.onSound = onSound;
        this.rect.scale.set(width + 4, fontSize + 4);
        this.add(this.rect);
        this.drawAfterChildren();
    }
    update(dt) {
        let mouse = this.input.mouse;
        if (mouse.leftClick) {
            if (this.rect.containsWorldVector(mouse.position) && !this.active) {
                this.#active.reset();
                this.onActive();
                if (this.onSound)
                    this.engine.soundBank.get(this.onSound)?.play();
            }
        }
        if (this.active)
            this.rect.displayColor = 'blue';
        else
            this.rect.displayColor = 'red';
    }
    onActive() { }
    draw(ctx) {
        ctx.save();
        ctx.scale(1, -1);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.fillStyle = this.active ? this.activeColor : this.color;
        ctx.fillText(this.text, 0, 0, this.width);
        ctx.restore();
    }
}
export class Label extends GameObject {
    text = '';
    align = 'left';
    fontSize = 12;
    font = 'sans-serif';
    color = 'white';
    baseline = 'middle';
    maxWidth = 300;
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
    constructor(text, align, fontSize, font, color, baseline, maxWidth) {
        super();
        this.text = text;
        this.align = align;
        this.fontSize = fontSize;
        this.font = font;
        this.color = color;
        this.baseline = baseline;
        this.maxWidth = maxWidth;
        this.drawAfterChildren();
    }
    draw(ctx) {
        ctx.save();
        ctx.textAlign = this.align;
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.textBaseline = this.baseline;
        ctx.fillStyle = this.color;
        ctx.scale(1, -1);
        ctx.fillText(this.text, 0, 0, this.maxWidth);
        ctx.restore();
    }
}
export class CheckBox extends GameObject {
    checked = false;
    rect = new Rectangle(0, 0, 1, 1);
    rectColor;
    checkColor;
    size;
    sound;
    constructor(checked = false, size = 10, rectColor = 'white', checkColor = 'red', sound = null) {
        super();
        this.checked = checked;
        this.rectColor = rectColor;
        this.checkColor = checkColor;
        this.size = size;
        this.sound = sound;
        this.rect.scale.set(size, size);
        this.add(this.rect);
    }
    update(dt) {
        let mouse = this.input.mouse;
        if (this.rect.containsWorldVector(mouse.position) && mouse.leftClick) {
            this.checked = !this.checked;
            this.onChange();
            if (this.sound)
                this.engine.soundBank.get(this.sound)?.play();
        }
    }
    onChange() { }
    draw(ctx) {
        let hs = this.size / 2;
        if (this.checked) {
            ctx.strokeStyle = this.checkColor;
            ctx.beginPath();
            ctx.moveTo(-hs, -hs);
            ctx.lineTo(hs, hs);
            ctx.moveTo(-hs, hs);
            ctx.lineTo(hs, -hs);
            ctx.stroke();
        }
        ctx.strokeStyle = this.rectColor;
        ctx.strokeRect(-hs, -hs, this.size, this.size);
    }
}
class Graph extends GameObject {
    nodes = new Set();
    nodesObjects = new Map();
    links = new Map();
    display = false;
    positionGetter = null;
    constructor(display = false, positionGetter = null) {
        super();
        this.display = display;
        this.positionGetter = positionGetter;
    }
    /**
     *
     * @param {...number} nodes
     */
    addNode(...nodes) {
        for (let [node, object] of nodes) {
            if (!this.nodes.has(node)) {
                this.nodes.add(node);
                this.nodesObjects.set(node, object);
                this.links.set(node, new Set());
            }
        }
    }
    /**
     *
     * @param {...number} nodes
     */
    removeNode(...nodes) {
        for (let node of nodes)
            if (this.hasNode(node)) {
                this.nodes.delete(node);
                this.nodesObjects.delete(node);
                this.links.delete(node);
                for (let [, map] of this.links)
                    map.delete(node);
            }
    }
    /**
     *
     * @param {number} node
     * @returns {boolean}
     */
    hasNode(node) { return this.nodes.has(node); }
    /**
     *
     * @param {...{source:number, target:number, data:any}} links
     */
    addLink(...links) {
        for (let link of links) {
            if (!this.hasNode(link.source) || !this.hasNode(link.target))
                continue;
            this.links.get(link.source).add(link.target);
        }
    }
    /**
     *
     * @param {...{source:number, target:number}} links
     */
    removeLink(...links) {
        for (let link of links)
            if (this.hasLink(link.source, link.target)) {
                this.links.get(link.source).delete(link.target);
            }
    }
    hasLink(source, target) { return this.links.has(source) && this.links.get(source).has(target); }
    isConnectedTo(source, target) {
        if (!this.hasNode(source))
            return false;
        if (!this.hasNode(target))
            return false;
        let nodeSet;
        let currentSet = new Set([source]);
        do {
            nodeSet = currentSet;
            currentSet = new Set(nodeSet);
            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target);
        } while (nodeSet.size != currentSet.size);
        return nodeSet.has(target);
    }
    isConnected(node) {
        if (!this.hasNode(node))
            return true;
        let nodeSet;
        let currentSet = new Set([node]);
        do {
            nodeSet = currentSet;
            currentSet = new Set(nodeSet);
            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target);
        } while (nodeSet.size != currentSet.size);
        return nodeSet.size == this.nodes.size;
    }
    isFullyConnected() {
        for (let node of this.nodes)
            if (!this.isConnected(node))
                return false;
        return true;
    }
    getShortestPathBetween(source, target, estimateDistance) {
        if (!this.hasNode(source) || !this.hasNode(target))
            return null;
        let nodes = new Map();
        this.nodes.forEach(id => nodes.set(id, new Node(id)));
        let start = nodes.get(source);
        let end = nodes.get(target);
        let closed = [];
        let opened = [start];
        while (opened.length) {
            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.heuristic < b.heuristic ? a : b)), 1)[0];
            let currentObject = this.nodesObjects.get(current.id);
            if (current == end) {
                let list = [end.id];
                let node = end;
                while (node.previous) {
                    node = node.previous;
                    list.push(node.id);
                }
                return list.reverse();
            }
            for (let neighbour of this.links.get(current.id)) {
                let node = nodes.get(neighbour);
                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id));
                if (!(closed.includes(node) || (opened.includes(node) && node.cost <= cost))) {
                    node.cost = cost;
                    node.heuristic = node.cost + estimateDistance(this.nodesObjects.get(node.id), this.nodesObjects.get(end.id));
                    node.previous = current;
                    opened.push(node);
                }
            }
            closed.push(current);
        }
        return null;
    }
    draw(ctx) {
        if (this.display && this.positionGetter) {
            ctx.restore();
            ctx.save();
            let positions = new Map();
            for (let [node, object] of this.nodesObjects) {
                positions.set(node, this.positionGetter(object));
            }
            ctx.strokeStyle = 'blue';
            for (let nodeA of this.links) {
                for (let nodeB of nodeA[1]) {
                    let p1 = positions.get(nodeA[0]);
                    let p2 = positions.get(nodeB);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        return true;
    }
}
class Node {
    cost = 0;
    heuristic = 0;
    previous = null;
    id;
    constructor(id) { this.id = id; }
}
class Path {
    points = [];
    currentPosition = new Vector();
    currentSegment = 1;
    constructor(vectors) {
        this.points = vectors;
        this.currentPosition.copy(this.points[0]);
    }
    length() {
        let length = 0;
        for (let index = 0; index < this.points.length - 1; index++)
            length += this.points[index].distanceTo(this.points[index + 1]);
        return length;
    }
    reset() {
        this.currentPosition.copy(this.points[0]);
        this.currentSegment = 0;
    }
    end() { return this.points.length == this.currentSegment; }
    follow(length) {
        let next = this.points[this.currentSegment];
        let distance = this.currentPosition.distanceTo(next);
        while (distance <= length) {
            length -= distance;
            this.currentPosition.copy(next);
            next = this.points[++this.currentSegment];
            distance = this.currentPosition.distanceTo(next);
            if (this.currentSegment == this.points.length)
                return this.currentPosition.clone();
        }
        this.currentPosition.add(next.clone().sub(this.currentPosition).normalize().multS(length));
        return this.currentPosition.clone();
    }
}
export class ImageManipulator {
    canvas;
    ctx;
    constructor(width, height) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }
    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }
    setPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }
    getPixel(x, y) {
        let data = this.ctx.getImageData(x, y, 1, 1);
        return [data.data[0], data.data[1], data.data[2], data.data[3]];
    }
    print() { return this.canvas.toDataURL('image/png'); }
    download(name) {
        let a = document.createElement('a');
        a.href = this.print();
        a.download = `${name}_${this.width}x${this.height}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    toString() { return this.print(); }
    static fromImage(image) {
        let im = new ImageManipulator(image.width, image.height);
        im.ctx.drawImage(image, 0, 0);
        return im;
    }
}
export class PseudoRandom {
    static a = 1664525;
    static c = 1013904223;
    static m = Math.pow(2, 32);
    seed;
    a = PseudoRandom.a;
    c = PseudoRandom.c;
    m = PseudoRandom.m;
    constructor(seed = Math.random()) {
        this.seed = seed;
    }
    get() {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed / this.m;
    }
    static get(seed = Math.random()) {
        return ((PseudoRandom.a * seed + PseudoRandom.c) % PseudoRandom.m) / PseudoRandom.m;
    }
}
export class PerlinNoise {
    rng;
    seed;
    grid;
    horizontalLoop;
    verticalLoop;
    depthLoop;
    constructor(seed = Math.random(), horizontalLoop = 2048, verticalLoop = 2048, depthLoop = 2048) {
        this.seed = seed;
        this.horizontalLoop = horizontalLoop;
        this.verticalLoop = verticalLoop;
        this.depthLoop = depthLoop;
        this.rng = new PseudoRandom(seed);
        this.grid = [];
        for (let x of range(horizontalLoop)) {
            this.grid.push([]);
            for (let y of range(verticalLoop)) {
                this.grid[x].push([]);
                for (let z of range(depthLoop)) {
                    // let r = this.rng.get() * Math.PI * 2
                    let s = this.seed ^ x ^ (y * 57) ^ (z * 29);
                    let xv = Math.cos(s);
                    let yv = Math.sin(s);
                    let zv = PseudoRandom.get(s) * 2 - 1;
                    let vec = new Vector(xv, yv, zv);
                    this.grid[x][y].push(vec);
                }
            }
        }
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    getVector(ix, iy, iz) {
        ix = ((ix % this.horizontalLoop) + this.horizontalLoop) % this.horizontalLoop;
        iy = ((iy % this.verticalLoop) + this.verticalLoop) % this.verticalLoop;
        iz = ((iz % this.depthLoop) + this.depthLoop) % this.depthLoop;
        let vec = this.grid[ix][iy][iz];
        return vec;
    }
    gradDotProduct(ix, iy, iz, x, y, z) {
        let distanceVector = new Vector(x - ix, y - iy, z - iz);
        let grad = this.getVector(ix, iy, iz);
        let product = distanceVector.dot(grad);
        return product;
    }
    get(x, y, z = 0) {
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;
        let z0 = Math.floor(z);
        let z1 = z0 + 1;
        let sx = this.fade(x - x0);
        let sy = this.fade(y - y0);
        let sz = this.fade(z - z0);
        let n0, n1, lpy0, lpy1, lpz0, lpz1, value;
        n0 = this.gradDotProduct(x0, y0, z0, x, y, z);
        n1 = this.gradDotProduct(x1, y0, z0, x, y, z);
        lpy0 = lerp(n0, n1, sx);
        n0 = this.gradDotProduct(x0, y1, z0, x, y, z);
        n1 = this.gradDotProduct(x1, y1, z0, x, y, z);
        lpy1 = lerp(n0, n1, sx);
        lpz0 = lerp(lpy0, lpy1, sy);
        n0 = this.gradDotProduct(x0, y0, z1, x, y, z);
        n1 = this.gradDotProduct(x1, y0, z1, x, y, z);
        lpy0 = lerp(n0, n1, sx);
        n0 = this.gradDotProduct(x0, y1, z1, x, y, z);
        n1 = this.gradDotProduct(x1, y1, z1, x, y, z);
        lpy1 = lerp(n0, n1, sx);
        lpz1 = lerp(lpy0, lpy1, sy);
        value = lerp(lpz0, lpz1, sz);
        return value;
    }
}
export class TextureMapper {
    static map(model, colorChart, texture) {
        let modelIM = ImageManipulator.fromImage(model);
        let colorChartIM = ImageManipulator.fromImage(colorChart);
        let textureIM = ImageManipulator.fromImage(texture);
        let outputIM = new ImageManipulator(model.width, model.height);
        for (let x = 0; x < modelIM.width; x++)
            for (let y = 0; y < modelIM.height; y++) {
                let modelColor = modelIM.getPixel(x, y);
                if (modelColor[3] == 0)
                    continue;
                let pixelLocation = TextureMapper.#findPixelWithColorInImage(colorChartIM, ...modelColor);
                if (!pixelLocation)
                    continue;
                let color = textureIM.getPixel(...pixelLocation);
                outputIM.setPixel(x, y, `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`);
            }
        return outputIM;
    }
    static #findPixelWithColorInImage(image, r, g, b, a) {
        for (let x = 0; x < image.width; x++)
            for (let y = 0; y < image.height; y++) {
                let data = image.getPixel(x, y);
                if (data[3] == a && data[0] == r && data[1] == g && data[2] == b)
                    return [x, y];
            }
        return null;
    }
    static downloadStandardColorChart(width, height) {
        if (width < 1 || width > 256 || height < 0 || height > 256)
            throw `Invalid dimensions`;
        let im = new ImageManipulator(width, height);
        for (let r = 0; r < width; r++)
            for (let g = 0; g < height; g++) {
                let color = `rgb(${255 - r * 256 / width}, ${255 - g * 256 / height}, ${Math.max(r * 256 / width, g * 256 / height)})`;
                console.log(r, g, color);
                im.setPixel(r, g, color);
            }
        im.download('colorchart');
    }
}
export function lerp(a, b, t) { return (1 - t) * a + t * b; }
export function coserp(a, b, t) {
    let t2 = (1 - Math.cos(t * Math.PI)) / 2;
    return (1 - t2) * a + t2 * b;
}
export function map(nbr, sourceMin, sourceMax, targetMin, targetMax) {
    let t = (nbr - sourceMin) / (sourceMax - sourceMin);
    let res = t * (targetMax - targetMin) + targetMin;
    return res;
}
let idCount = 0;
export function id() { return ++idCount; }
function* range(min, max = null, step = 1) {
    if (!max) {
        max = min;
        min = 0;
    }
    for (let i = min; i < max; i += step)
        yield i;
}
class NetworkEvents {
    static PEER_OPENED = 0; // id has been obtained
    static UNAVAILABLE_ID = 13; // id could not be obtained
    static INVALID_ID = 14; // id is invalid
    static PEER_CONNECTION = 1; // A user is connecting to you
    static PEER_CLOSED = 2; // When peer is destroyed
    static PEER_DISCONNECT = 3; // Disconnected from signaling server
    static PEER_ERROR = 4; // Fatal errors, moslty
    static HOST_P2P_OPENED = 5;
    static HOST_P2P_CLOSED = 6;
    static HOST_P2P_RECEIVED_DATA = 7;
    static CLIENT_P2P_OPENED = 8;
    static CLIENT_P2P_CLOSED = 9;
    static CLIENT_P2P_RECEIVED_DATA = 10;
    static CLIENT_P2P_CONFIRMED_CONNECTION = 15;
    static HOSTING_START = 11;
    static HOSTING_END = 12;
}
/**
 * The Network class uses PeerJS to manage P2P connection.
 * On top of peerjs it manages timeouts conditional hosting (whitelist blacklist)
 *    and auto rejection against unwanted connections.
 */
export class Network {
    static events = NetworkEvents;
    static peer = null;
    static id = null;
    static isHosting = false;
    static maxClient = 15;
    static acceptConnections = true;
    static useWhitelist = true;
    static whitelist = [];
    static blacklist = [];
    static connections = new Map();
    static callbacks = new Map();
    /**
     * Returns true if SimplePeer is defined in the window object
     * This value should be defined by default by the simple-peer implementaton
     *
     * @returns {boolean}
     */
    static enabled() { return window.Peer != null; }
    /**
     * Throw an error if Network.enabled returns false
     */
    static assertEnabled() { if (!Network.enabled())
        throw new Error('PeerJS must be included and defined in window.Peer for Network functionalities to work'); }
    /**
     * Returns true if there is any connection currenlty active
     *
     * @returns {boolean}
     */
    static hasConnections() { return Network.connections.size !== 0; }
    /**
     * Returns true if the network is hosting and the number of connection currently active is at least equal to Network.maxClient
     *
     * @returns {boolean}
     */
    static isFull() { return Network.connections.size >= Network.maxClient; }
    /**
     * Connect to the signaling server
     *
     * @param {string} id
     * @param {any} options see peerjs documentation for Peer options
     */
    static start(id, options = undefined) {
        let peer = new window.Peer(id, options);
        peer.on('open', () => {
            Network.peer = peer;
            Network.id = peer.id;
            for (let callback of Network.getCallbacks(NetworkEvents.PEER_OPENED))
                callback.call(Network, Network.id);
        });
        peer.on('connection', (conn) => {
            let networkConnection = new NetworkConnection(conn, true);
            this.connections.set(networkConnection.id, networkConnection);
            for (let callback of Network.getCallbacks(NetworkEvents.PEER_CONNECTION))
                callback.call(Network, networkConnection);
        });
        peer.on('close', () => {
            for (let callback of Network.getCallbacks(NetworkEvents.PEER_CLOSED))
                callback.call(Network);
        });
        peer.on('error', (error) => {
            if (error.type === 'unavailable-id')
                for (let callback of Network.getCallbacks(NetworkEvents.UNAVAILABLE_ID))
                    callback.call(Network);
            else if (error.type === 'invalid-id')
                for (let callback of Network.getCallbacks(NetworkEvents.INVALID_ID))
                    callback.call(Network);
            else
                for (let callback of Network.getCallbacks(NetworkEvents.PEER_ERROR))
                    callback.call(Network, error);
        });
        peer.on('disconnected', () => {
            for (let callback of Network.getCallbacks(NetworkEvents.PEER_DISCONNECT))
                callback.call(Network);
        });
    }
    static reconnect() {
        if (Network.peer && Network.peer.disconnected)
            Network.peer.reconnect();
    }
    /**
     * Enable hosting, if any connection is opened at time,
     * uses abortIfConnections to determined if those connections should be closed and the operation should proceed
     * Returns the new state of isHosting
     *
     * @param {boolean} abortIfConnections
     * @returns {boolean}
     */
    static enableHosting(abortIfConnections = false) {
        if (!Network.isHosting)
            if (!Network.hasConnections() || !abortIfConnections) {
                this.isHosting = true;
                Network.closeAllConnections();
            }
        return this.isHosting;
    }
    /**
     * Disable hosting, if any connection is opened at time,
     * uses abortIfConnections to determined if those connections should be closed and the operation should proceed.
     * Returns the new state of isHosting.
     *
     * @param {boolean} abortIfConnections
     * @returns {boolean}
     */
    static disableHosting(abortIfConnections = false) {
        if (Network.isHosting)
            if (!Network.hasConnections() || !abortIfConnections) {
                Network.closeAllConnections();
                this.isHosting = false;
            }
        return this.isHosting;
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
    static connectTo(id) {
        if (id === this.id)
            throw `You can't connect to yourself`;
        if (!Network.peer)
            throw `You can't connect to somebody without starting the Network and being connected to the signaling server`;
        if (Network.isHosting)
            throw `You can't connect to somebody while hosting`;
        if (Network.hasConnections())
            throw `You can only connect to one peer at a time`;
        let networkConnection = new NetworkConnection(Network.peer.connect(id), false);
        Network.connections.set(networkConnection.id, networkConnection);
        return networkConnection;
    }
    /**
     * Send any data to a given connected peer if it exists
     *
     * @param {string} id
     * @param {any} data
     */
    static sendTo(id, data) {
        Network.connections.get(id)?.connection.send(data);
    }
    /**
     * Send any data to every connected peer
     *
     * @param {any} data
     */
    static sendToAll(data) {
        for (let connection of Network.connections)
            connection[1].connection.send(data);
    }
    /**
     * Send any data to every connected peer except a given one
     *
     * @param {string} id
     * @param {any} data
     */
    static sendToAllExcept(id, data) {
        for (let connection of Network.connections)
            if (connection[0] !== id)
                connection[1].connection.send(data);
    }
    /**
     * Close the connection to a given peer if it exists
     *
     * @param {string} id
     */
    static closeConnection(id) {
        Network.connections.get(id)?.cleanclose();
    }
    /**
     * Close the connection with all connected peer
     */
    static closeAllConnections() {
        for (let connection of Network.connections)
            connection[1].cleanclose();
    }
    /**
     * Add a callback for a given event
     *
     * @param {NetworkEvents} event
     * @param callback
     */
    static on(event, callback) {
        if (!Network.callbacks.has(event))
            Network.callbacks.set(event, []);
        Network.callbacks.get(event).push(callback);
    }
    /**
     * Returns all callbacks associated with the given event
     *
     * @param {NetworkEvents} event
     * @returns {((data:any)=>void)[]}
     */
    static getCallbacks(event) {
        return Network.callbacks.get(event) ?? [];
    }
    /**
     * Puts a given id into the whitelist
     *
     * @param {string} id
     */
    static allow(id) {
        Network.whitelist.push(id);
    }
    /**
     * Removes a given id from the whitelist, closing the connection if it exists
     *
     * @param {string} id
     */
    static deny(id) {
        let index = Network.whitelist.indexOf(id);
        if (index !== -1)
            Network.whitelist.splice(index, 1);
        if (this.useWhitelist && this.isHosting)
            Network.connections.get(id)?.cleanclose();
    }
    /**
     * Puts a given id into the blacklist, closing the connection if it exists
     *
     * @param {string} id
     */
    static ban(id) {
        Network.blacklist.push(id);
        Network.connections.get(id)?.cleanclose();
    }
    /**
     * Removes a given id from the blacklist
     *
     * @param {string} id
     */
    static unban(id) {
        let index = Network.blacklist.indexOf(id);
        if (index !== -1)
            Network.blacklist.splice(index, 1);
    }
}
class NetworkConnection {
    connection;
    timer = new Timer();
    intervalID;
    receiver;
    constructor(connection, receiver) {
        this.connection = connection;
        this.receiver = receiver;
        this.intervalID = setInterval(this.#timeout.bind(this), 1000);
        this.connection.on('open', this.#open.bind(this));
        this.connection.on('close', this.#close.bind(this));
        this.connection.on('data', this.#data.bind(this));
    }
    #timeout() {
        if (this.timer.greaterThan(6000)) {
            this.cleanclose();
            // console.log(`Connection with "${this.id}" timed out`)
        }
        else
            this.connection.send('Network$IAMHERE');
    }
    #open() {
        // console.log(`connection opened with ${this.id}`)
        if (this.receiver) {
            if (!Network.isHosting || !Network.acceptConnections ||
                Network.isFull() ||
                Network.blacklist.includes(this.id) ||
                Network.useWhitelist && !Network.whitelist.includes(this.id)) {
                this.cleanclose();
            }
            else {
                for (let callback of Network.getCallbacks(NetworkEvents.HOST_P2P_OPENED))
                    callback.call(this);
                this.connection.send('Network$CONFIRM');
            }
        }
        else {
            for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_OPENED))
                callback.call(this);
        }
    }
    #close() {
        // console.log(`connection closed with ${this.id}`)
        if (this.receiver) {
            for (let callback of Network.getCallbacks(NetworkEvents.HOST_P2P_CLOSED))
                callback.call(this);
        }
        else {
            for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_CLOSED))
                callback.call(this);
        }
        this.clean();
    }
    #data(data) {
        this.timer.reset();
        if (data === 'Network$CLOSE')
            this.cleanclose();
        else if (data === 'Network$IAMHERE')
            return;
        else if (data === 'Network$CONFIRM' && !this.receiver)
            for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_CONFIRMED_CONNECTION))
                callback.call(this, data);
        else if (this.receiver)
            for (let callback of Network.getCallbacks(NetworkEvents.HOST_P2P_RECEIVED_DATA))
                callback.call(this, data);
        else
            for (let callback of Network.getCallbacks(NetworkEvents.CLIENT_P2P_RECEIVED_DATA))
                callback.call(this, data);
    }
    get id() { return this.connection.peer; }
    /**
     * Removes the connection from Network.connections and deletes the timeout interval
     */
    clean() {
        clearInterval(this.intervalID);
        Network.connections.delete(this.id);
    }
    /**
     * Sends a closing message to the connected peer and closes the connection with it
     */
    close() {
        this.connection.send('Network$CLOSE');
        setTimeout(() => { this.connection.close(); }, 250);
    }
    /**
     * Execute the function this.clean() and this.close()
     */
    cleanclose() {
        this.clean();
        this.close();
    }
}
export class NetworkGameObject extends GameObject {
    static list = new Map();
    static inherited = new Map();
    static pendingUpdates = [];
    static inherit() { NetworkGameObject.inherited.set(this.name, this); }
    static { this.inherit(); }
    static build(instruction) {
        let object = new (NetworkGameObject.inherited.get(instruction.proto))();
        object.owner = instruction.data.owner;
        object.secID = instruction.data.id;
        object.source(instruction.data);
        return object;
    }
    static register(object, owner, id) {
        if (!NetworkGameObject.list.has(owner))
            NetworkGameObject.list.set(owner, new Map());
        NetworkGameObject.list.get(owner).set(id, object);
    }
    static getRegistered(owner) {
        return [...(NetworkGameObject.list.get(owner)?.values() ?? [])];
    }
    static getRegisteredObject(owner, id) {
        if (!NetworkGameObject.isRegistered(owner, id))
            return null;
        return NetworkGameObject.list.get(owner).get(id);
    }
    static isRegistered(owner, id) {
        return NetworkGameObject.list.has(owner) && NetworkGameObject.list.get(owner).has(id);
    }
    static flushPendingUpdates() {
        Network.sendToAll({ event: 'Network$updates', data: NetworkGameObject.pendingUpdates });
        NetworkGameObject.pendingUpdates = [];
    }
    static hasPendingUpdates() { return this.pendingUpdates.length !== 0; }
    secID = null;
    synced = false;
    owner = null;
    constructor() {
        super();
    }
    source(data) { }
    sync() {
        if (!window.Peer)
            return;
        if (!this.synced) {
            this.synced = true;
            this.owner = Network.id;
            this.secID = this.id;
            NetworkGameObject.register(this, Network.id, this.id);
        }
        if (this.owner !== Network.id)
            return;
        let parent = this.parent;
        let message = {
            event: 'Network$newobject',
            data: {
                data: badclone(this),
                proto: this.constructor.name,
                owner: Network.id,
                scene: this.scene?.id,
                parent: {
                    owner: parent?.owner,
                    id: parent?.secID
                }
            }
        };
        Network.sendToAll(message);
    }
    sendUpdate(data) {
        let message = { owner: this.owner, id: this.secID, data };
        NetworkGameObject.pendingUpdates.push(message);
    }
    recvUpdate(data) { }
    syncMoveToObject(owner, id) {
        NetworkGameObject.getRegisteredObject(owner, id).add(this);
        let message = {
            move: true, owner: this.owner, id: this.secID, data: {
                scene: undefined,
                parent: { owner, id }
            }
        };
        NetworkGameObject.pendingUpdates.push(message);
    }
    syncMoveToScene(scene) {
        GameScene.list.get(scene).add(this);
        let message = {
            move: true, owner: this.owner, id: this.secID, data: {
                scene,
                parent: {}
            }
        };
        NetworkGameObject.pendingUpdates.push(message);
    }
    syncKill() {
        this.kill();
        let message = {
            kill: true, owner: this.owner, id: this.secID
        };
        NetworkGameObject.pendingUpdates.push(message);
        NetworkGameObject.list.get(this.owner).delete(this.secID);
    }
}
{ // Auto NetworkGameObject Management
    function moveObjectTo(object, scene, parent) {
        if (scene) {
            if (!GameScene.list.has(scene))
                throw `Missing stored scene with id ${scene}`;
            GameScene.list.get(scene).add(object);
        }
        else {
            if (!NetworkGameObject.isRegistered(parent.owner, parent.id))
                throw `Missing move target for object ${object.owner}:${object.secID}`;
            NetworkGameObject.getRegisteredObject(parent.owner, parent.id).add(object);
        }
    }
    function killObject(owner, id) {
        if (NetworkGameObject.isRegistered(owner, id)) {
            let object = NetworkGameObject.getRegisteredObject(owner, id);
            object.kill();
            NetworkGameObject.list.get(owner).delete(object.secID);
        }
    }
    function createObject(message) {
        if (message.event === 'Network$newobject') {
            let { data, owner, scene, parent } = message.data;
            if (NetworkGameObject.isRegistered(owner, data.id))
                return;
            let object = NetworkGameObject.build(message.data);
            object.source(message.data.data);
            NetworkGameObject.register(object, owner, data.id);
            moveObjectTo(object, scene, parent);
        }
    }
    function newuser(message) {
        if (message.event === 'Network$newuser') {
            executeSync();
        }
    }
    function executeSync() {
        for (let object of NetworkGameObject.getRegistered(Network.id))
            object.sync();
    }
    function updates(message) {
        if (message.event === 'Network$updates') {
            let updates = message.data;
            for (let update of updates) {
                let object = NetworkGameObject.getRegisteredObject(update.owner, update.id);
                if (object) {
                    if (update.move) {
                        moveObjectTo(object, update.data.scene, update.data.parent);
                    }
                    else if (update.kill) {
                        killObject(update.owner, update.id);
                    }
                    else
                        object.recvUpdate(update.data);
                }
            }
        }
    }
    Network.on(NetworkEvents.PEER_OPENED, function (id) {
        let nulls = NetworkGameObject.list.get(null) ?? [];
        for (let [key, object] of nulls) {
            object.synced = false;
            object.owner = null;
            object.secID = null;
            object.sync();
        }
        NetworkGameObject.list.delete(null);
    });
    Network.on(NetworkEvents.CLIENT_P2P_OPENED, function () {
        executeSync();
    });
    Network.on(NetworkEvents.HOST_P2P_OPENED, function () {
        executeSync();
        Network.sendToAllExcept(this.id, { event: 'Network$newuser', data: this.id });
    });
    Network.on(NetworkEvents.CLIENT_P2P_CLOSED, function () {
        for (let [owner, objects] of NetworkGameObject.list) {
            if (owner === Network.id)
                continue;
            for (let [id, object] of objects)
                object.kill();
            NetworkGameObject.list.delete(owner);
        }
    });
    Network.on(NetworkEvents.HOST_P2P_CLOSED, function () {
        Network.sendToAll({ event: 'Network$killuser', data: this.id });
        let objects = NetworkGameObject.getRegistered(this.id);
        for (let object of objects)
            object.kill();
        NetworkGameObject.list.delete(this.id);
    });
    Network.on(NetworkEvents.CLIENT_P2P_RECEIVED_DATA, function (message) {
        if (typeof message !== 'object')
            return;
        createObject(message);
        newuser(message);
        updates(message);
    });
    Network.on(NetworkEvents.HOST_P2P_RECEIVED_DATA, function (message) {
        if (typeof message !== 'object')
            return;
        Network.sendToAllExcept(this.id, message);
        createObject(message);
        updates(message);
    });
}
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value))
                return;
            seen.add(value);
        }
        return value;
    };
};
export function badclone(o) { return JSON.parse(JSON.stringify(o, getCircularReplacer())); }
export { Graph, Path, };
