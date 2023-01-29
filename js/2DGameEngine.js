import { Network, NetworkEvents } from '../PeerJS-Network/js/Network.js';
import { Transform, TransformMatrix, Vector, map } from './2DGEMath.js';
import { SVGStringToImage, badclone, id, range } from './2DGEUtils.js';
const PI2 = Math.PI * 2;
const gameEngineConstructorArguments = {
    width: innerWidth,
    height: innerHeight,
    verticalPixels: 100,
    scaling: 2,
    canvas: null,
    images: [],
    svgs: [],
    sounds: []
};
/**
 * GameEngine is the class responsible for the execution of the game loop, the canvas and resize change, and the scene management
 */
export class GameEngine {
    /**
     * The canvas on which the GameEngine will draw.
     * Shall not be modified.
     * Can be accessed to retrieved generated canvas if none is passed as argument.
     */
    canvas = null;
    /**
     * The context on which the GameEngine will draw.
     * Shall not be modified.
     */
    ctx = null;
    /**
     * The input is here to query the keyboard inputs and the mouse inputs.
     */
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
    /**
     * Contains all the images loaded at the engine contruction.
     */
    imageBank = new Map();
    /**
     * Contains all the svg loaded at the engine construction.
     */
    svgBank = new Map();
    /**
     * Contains all the sounds loaded at the engine construction.
     */
    soundBank = new Map();
    #lock0 = true;
    #locks = [true, true, true];
    #loadedImagesCount = 0;
    #imageToLoadCount = 0;
    #loadedSVGCount = 0;
    #svgToLoadCount = 0;
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
        this.canvas = args.canvas ?? document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.input.bindMouse(this.canvas, (vector) => {
            let sc = this.usableScale;
            let half = this.usableScale.clone().divS(2);
            vector.mult(sc).sub(half);
            vector.y *= -1;
            if (this.#currentScene && this.#currentScene.camera) {
                let matrix = this.#currentScene.camera.getWorldTransformMatrix();
                vector = TransformMatrix.multVec(matrix, vector);
            }
            return vector;
        });
        this.canvas.style.position = 'relative';
        this.canvas.style.backgroundColor = 'black';
        this.resize(args.width, args.height, args.scaling, args.verticalPixels);
        this.#imageToLoadCount = args.images.length;
        this.#svgToLoadCount = args.svgs.length;
        this.#soundToLoadCount = args.sounds.map(e => e.srcs.length).reduce((a, b) => a + b, 0);
        this.imageBank = loadImages(args.images, (n) => { this.#loadedImagesCount = n; }, () => {
            this.#locks[0] = false;
            this.#checkLocks();
        });
        this.soundBank = loadSounds(args.sounds, (n) => { this.#loadedSoundCount = n; }, () => {
            this.#locks[1] = false;
            this.#checkLocks();
        });
        this.svgBank = loadSVGs(args.svgs, (n) => { this.#loadedSVGCount = n; }, () => {
            this.#locks[2] = false;
            this.#checkLocks();
        });
    }
    get trueWidth() { return this.#trueWidth; }
    get trueHeight() { return this.#trueHeight; }
    get usableWidth() { return this.#usableWidth; }
    get usableHeight() { return this.#usableHeight; }
    get usableScale() { return new Vector(this.usableWidth, this.usableHeight); }
    get verticalPixels() { return this.#verticalPixels; }
    get dt() { return this.#dt; }
    get scene() { return this.#currentScene; }
    #checkLocks() {
        if (this.#locks.every(lock => lock === false)) {
            this.#lock0 = false;
            this.#ressourcesLoadedCallbacks.forEach(func => func.call(this));
        }
    }
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
            let value = this.#loadedImagesCount + this.#loadedSVGCount + this.#loadedSoundCount;
            let tot = this.#imageToLoadCount + this.#svgToLoadCount + this.#soundToLoadCount;
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
        this.input.gamepadLoop();
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
export function fullScreen(engine) {
    let verticalPixels = engine.verticalPixels;
    const handler = () => {
        if (innerHeight < innerWidth)
            engine.resize(innerWidth, innerHeight, devicePixelRatio, verticalPixels);
        else {
            const ratio = innerHeight / innerWidth;
            const adaptedVerticalPixels = verticalPixels * ratio;
            engine.resize(innerWidth, innerHeight, devicePixelRatio, adaptedVerticalPixels);
        }
    };
    window.addEventListener('resize', handler);
    handler();
}
export var RenderingType;
(function (RenderingType) {
    RenderingType[RenderingType["INFINITY"] = 0] = "INFINITY";
    // static IN_VIEW = 1 // Render only the object that are in the cameraview, or at default position and range if no camera is set // Distance to camera computation for all object // Recommended when lot of object with little child depth
    RenderingType[RenderingType["IN_VIEW"] = 1] = "IN_VIEW"; // Render only the object for which the root object is in camera range // Distance to camera computation for root object only // Recommended when lots of object with lots of child depth
})(RenderingType || (RenderingType = {}));
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
    renderingType = RenderingType.INFINITY;
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
    childrenDrawFilter(children) { return children; }
    getDrawRange() {
        let drawRange = new Vector(this.engine.usableWidth, this.engine.usableHeight).length() / 2;
        if (this.camera)
            drawRange *= this.camera.getRange();
        return drawRange;
    }
    getCameraPosition() {
        return this.camera?.getWorldPosition() ?? new Vector(0, 0);
    }
    /**
     * Draw the scene and its children (children first)
     * Is called by the GameEngine to draw the scene
     * Should not be called by the user
     *
     * @param ctx
     */
    executeDraw(ctx) {
        let drawRange = this.getDrawRange();
        let cameraPosition = this.getCameraPosition();
        if (this.camera) {
            ctx.transform(...this.camera.getViewTransformMatrix());
        }
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
        this.draw(ctx);
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
export class GameComponent extends GameObject {
    unique = false;
    componentTag = 'basic-component';
    constructor() {
        super();
        this.addTag('component');
        this.addTag(this.componentTag);
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
    #charDown = new Set();
    #charOnce = new Set();
    #keysDown = new Set();
    #keysOnce = new Set();
    constructor() {
        window.addEventListener('keydown', (evt) => {
            this.#charDown.add(evt.key);
            this.#charOnce.add(evt.key);
            this.#keysDown.add(evt.code);
            this.#keysOnce.add(evt.code);
        });
        window.addEventListener('keyup', (evt) => {
            this.#charDown.delete(evt.key);
            this.#charOnce.delete(evt.key);
            this.#keysDown.delete(evt.code);
            this.#keysOnce.delete(evt.code);
        });
    }
    /**
     * Return true if the given char is down
     *
     * @param {string} char
     * @returns {boolean}
     */
    isCharDown(char) { return this.#charDown.has(char); }
    /**
     * return true once if the given char is down, must be repressed to return true again
     *
     * @param {string} code
     * @returns {boolean}
     */
    isCharPressed(char) {
        if (this.#charOnce.has(char)) {
            this.#charOnce.delete(char);
            return true;
        }
        return false;
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
    // Mouse
    #bindedElement;
    #mouseButtons = [false, false, false];
    #mousePosition = new Vector();
    #trueMousePosition = new Vector();
    #mouseIn = false;
    #mouseClick = [false, false, false];
    #mouseScroll = 0;
    positionAdapter = function (vector) { return vector; };
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
            position: this.#trueMousePosition.clone(),
            scroll: this.#mouseScroll,
            in: this.#mouseIn
        };
        return result;
    }
    /**
     * Bind the input object to an html element, a position adapter function can be passed to convert the 0 to 1 default output to a preferable unit
     *
     * @param {HTMLElement} element
     * @param {(vector:Vector)=>Vector} positionAdapter
     */
    bindMouse(element, positionAdapter = function (vector) { return vector; }) {
        this.positionAdapter = positionAdapter;
        this.#bindedElement = element;
        element.addEventListener('contextmenu', evt => evt.preventDefault());
        element.addEventListener('mousedown', this.#handleMouseEvent.bind(this));
        element.addEventListener('mouseup', this.#handleMouseEvent.bind(this));
        element.addEventListener('mousemove', this.#handleMouseEvent.bind(this));
        element.addEventListener('mouseleave', this.#handleMouseEvent.bind(this));
        element.addEventListener('mouseenter', this.#handleMouseEvent.bind(this));
        element.addEventListener('wheel', this.#handleMouseEvent.bind(this));
    }
    mouseLoop() {
        this.#to01();
        for (let index = 0; index < 3; index++)
            this.#mouseClick[index] = false;
        this.#mouseScroll = 0;
    }
    /**
     * Handle the mouse related operations
     *
     * @param {MouseEvent} evt
     */
    #handleMouseEvent(evt) {
        let prev = [this.#mouseButtons[0], this.#mouseButtons[1], this.#mouseButtons[2]];
        this.#handleButtons(evt.buttons);
        this.#mousePosition.set(evt.offsetX, evt.offsetY);
        this.#mouseIn = this.#mousePosition.x > 0 && this.#mousePosition.x < 1 &&
            this.#mousePosition.y > 0 && this.#mousePosition.y < 1;
        for (let index = 0; index < 3; index++)
            if (!this.#mouseButtons[index] && prev[index])
                this.#mouseClick[index] = true;
        if (evt instanceof WheelEvent)
            this.#mouseScroll += Math.sign(evt.deltaY);
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
    #to01() {
        this.#trueMousePosition = this.positionAdapter(this.#mousePosition
            .clone()
            .div(new Vector(this.#bindedElement.offsetWidth, this.#bindedElement.offsetHeight, 1)));
    }
    // Gamepad
    #gamepadMap = new Map();
    #gamepad = {
        left_joystick: new Vector(),
        left_joystick_right_dir: 0,
        left_joystick_left_dir: 0,
        left_joystick_up_dir: 0,
        left_joystick_down_dir: 0,
        left_joystick_button: 0,
        left_button: 0,
        left_trigger: 0,
        right_joystick: new Vector(),
        right_joystick_right_dir: 0,
        right_joystick_left_dir: 0,
        right_joystick_up_dir: 0,
        right_joystick_down_dir: 0,
        right_joystick_button: 0,
        right_button: 0,
        right_trigger: 0,
        button_A: 0,
        button_B: 0,
        button_X: 0,
        button_Y: 0,
        button_left_arrow: 0,
        button_right_arrow: 0,
        button_up_arrow: 0,
        button_down_arrow: 0,
        button_back: 0,
        button_start: 0,
        button_home: 0,
    };
    #calibrated = false;
    deadPoint = .1;
    #recordInput = null;
    #recordOK = null;
    #recordKO = null;
    #gamepadCalibration = null;
    #axesDefaultValue = null;
    get isGamepadCalibrating() { return this.#gamepadCalibration !== null; }
    get gamepad() {
        return {
            left_joystick: this.#gamepad.left_joystick.clone(),
            left_joystick_right_dir: this.#gamepad.left_joystick_right_dir,
            left_joystick_left_dir: this.#gamepad.left_joystick_left_dir,
            left_joystick_up_dir: this.#gamepad.left_joystick_up_dir,
            left_joystick_down_dir: this.#gamepad.left_joystick_down_dir,
            left_joystick_button: this.#gamepad.left_joystick_button,
            left_button: this.#gamepad.left_button,
            left_trigger: this.#gamepad.left_trigger,
            right_joystick: this.#gamepad.right_joystick.clone(),
            right_joystick_right_dir: this.#gamepad.right_joystick_right_dir,
            right_joystick_left_dir: this.#gamepad.right_joystick_left_dir,
            right_joystick_up_dir: this.#gamepad.right_joystick_up_dir,
            right_joystick_down_dir: this.#gamepad.right_joystick_down_dir,
            right_joystick_button: this.#gamepad.right_joystick_button,
            right_button: this.#gamepad.right_button,
            right_trigger: this.#gamepad.right_trigger,
            button_A: this.#gamepad.button_A,
            button_B: this.#gamepad.button_B,
            button_X: this.#gamepad.button_X,
            button_Y: this.#gamepad.button_Y,
            button_left_arrow: this.#gamepad.button_left_arrow,
            button_right_arrow: this.#gamepad.button_right_arrow,
            button_up_arrow: this.#gamepad.button_up_arrow,
            button_down_arrow: this.#gamepad.button_down_arrow,
            button_back: this.#gamepad.button_back,
            button_start: this.#gamepad.button_start,
            button_home: this.#gamepad.button_home,
            is_calibrating: this.isGamepadCalibrating,
            is_calibrated: this.#calibrated,
            has_gamepad: navigator.getGamepads().length != 0
        };
    }
    #getCorrectedAxisValue(gamepad, index) {
        let defaultValue = this.#axesDefaultValue[index];
        let value = gamepad.axes[index];
        if (defaultValue !== 0) {
            if (defaultValue < 0)
                value = map(value, defaultValue, 1, 0, 1);
            else
                value = map(value, defaultValue, -1, 0, 1);
        }
        return value;
    }
    // Calibreation
    /**
     * Start the process of calibrating the axes of the connected controller.
     * This includes but is not limited to: Joysticks, Triggers, Cross buttons...
     *
     * @param {(axesStates: number[]) => void | null} updateCallback
     * @returns {Promise<void>}
     */
    calibrateGamepad(updateCallback = null) {
        return new Promise((ok, ko) => {
            this.#gamepadCalibration = {
                ok: ok,
                update: updateCallback,
                axesStates: null,
                axesTimer: null,
            };
        });
    }
    #setupCalibration(gamepad) {
        let axesCount = gamepad.axes.length;
        this.#gamepadCalibration.axesStates = [];
        this.#gamepadCalibration.axesTimer = [];
        this.#axesDefaultValue = [];
        for (let i of range(axesCount)) {
            this.#gamepadCalibration.axesStates.push(0);
            this.#gamepadCalibration.axesTimer.push({ timer: new Timer(), value: 0 });
            this.#axesDefaultValue.push(0);
        }
    }
    #pickupAxesForCalibration(gamepad) {
        this.#getAllCurrentGamepadInputs(gamepad)
            .filter(entry => entry.type === 'axes')
            .filter(entry => this.#gamepadCalibration.axesStates[entry.index] === 0)
            .forEach(entry => {
            this.#gamepadCalibration.axesStates[entry.index]++;
            this.#gamepadCalibration.axesTimer[entry.index].timer.reset();
            this.#gamepadCalibration.update?.([...this.#gamepadCalibration.axesStates]);
        });
    }
    #calibratePickedupAxes(gamepad) {
        let axesCalibrating = this.#gamepadCalibration.axesStates
            .map((entry, index) => entry === 1 ? index : -1)
            .filter(entry => entry !== -1);
        for (let axisIndex of axesCalibrating) {
            let axisValue = gamepad.axes[axisIndex];
            if (Math.abs(axisValue) < this.deadPoint)
                axisValue = 0;
            let axis = this.#gamepadCalibration.axesTimer[axisIndex];
            if (axis.value !== axisValue) {
                axis.timer.reset();
                axis.value = axisValue;
            }
            else if (axis.timer.greaterThan(2000)) {
                this.#gamepadCalibration.axesStates[axisIndex]++;
                this.#axesDefaultValue[axisIndex] = axisValue;
                this.#gamepadCalibration.update?.([...this.#gamepadCalibration.axesStates]);
            }
        }
        if (this.#gamepadCalibration.axesStates.every(entry => entry === 2)) {
            this.#gamepadCalibration.ok();
            this.#gamepadCalibration = null;
            this.#calibrated = true;
        }
    }
    #calibrationLoop(gamepad) {
        if (this.#gamepadCalibration && this.#gamepadCalibration.axesStates === null)
            this.#setupCalibration(gamepad);
        this.#pickupAxesForCalibration(gamepad);
        this.#calibratePickedupAxes(gamepad);
    }
    // Record Controls
    getGamepadControlAccess(gamepadControl) {
        let gca = this.#gamepadMap.get(gamepadControl);
        return gca ? { ...gca } : undefined;
    }
    #getAllCurrentGamepadInputs(gamepad) {
        let axisInput = gamepad.axes
            .map((axe, index) => {
            axe = this.#getCorrectedAxisValue(gamepad, index);
            return { data: { type: 'axes', index, inverted: axe < 0 }, value: Math.abs(axe) };
        })
            .filter(entry => entry.value > .5)
            .map(entry => entry.data);
        let buttonsInput = gamepad.buttons
            .map((button, index) => ({ data: { type: 'buttons', index, inverted: button.value < 0 }, value: Math.abs(button.value) }))
            .filter(entry => entry.value > .5)
            .map(entry => entry.data);
        return [...axisInput, ...buttonsInput];
    }
    #recordLoop(gamepad) {
        let input = this.#getAllCurrentGamepadInputs(gamepad)[0];
        if (input) {
            let duplicate = [...this.#gamepadMap.entries()].find(([_, entry]) => entry.type === input.type && entry.index === input.index && entry.inverted === input.inverted);
            if (duplicate)
                this.#recordKO(duplicate[0]);
            else {
                this.#gamepadMap.set(this.#recordInput, input);
                this.#recordOK();
            }
            this.#recordInput = this.#recordOK = this.#recordKO = null;
        }
    }
    #processGamepadControl(gamepad, gamepadControl) {
        let gamepadControlAccess = this.#gamepadMap.get(gamepadControl);
        if (!gamepadControlAccess)
            return 0;
        let value = 0;
        if (gamepadControlAccess.type === 'axes')
            value = this.#getCorrectedAxisValue(gamepad, gamepadControlAccess.index);
        else
            value = gamepad.buttons[gamepadControlAccess.index].value;
        if (Math.abs(value) < this.deadPoint)
            value = 0;
        if (gamepadControlAccess.inverted)
            value *= -1;
        return 0 > value ? 0 : value;
    }
    #gamepadInputUpdateLoop(gamepad) {
        for (let key of Object.keys(GamepadControl))
            this.#gamepad[key] = this.#processGamepadControl(gamepad, GamepadControl[key]);
        this.#gamepad.left_joystick.set(this.#gamepad.left_joystick_right_dir - this.#gamepad.left_joystick_left_dir, this.#gamepad.left_joystick_up_dir - this.#gamepad.left_joystick_down_dir);
        this.#gamepad.right_joystick.set(this.#gamepad.right_joystick_right_dir - this.#gamepad.right_joystick_left_dir, this.#gamepad.right_joystick_up_dir - this.#gamepad.right_joystick_down_dir);
    }
    gamepadLoop() {
        let gamepad = navigator.getGamepads()[0];
        if (!gamepad)
            return;
        if (!this.#axesDefaultValue)
            this.#axesDefaultValue = new Array().fill(0, 0, gamepad.axes.length);
        if (this.isGamepadCalibrating)
            this.#calibrationLoop(gamepad);
        if (this.#recordOK)
            this.#recordLoop(gamepad);
        this.#gamepadInputUpdateLoop(gamepad);
    }
    recordGamepadControl(gamepadControl) {
        return new Promise((ok, ko) => {
            this.#gamepadMap.delete(gamepadControl);
            this.#recordOK = ok;
            this.#recordKO = ko;
            this.#recordInput = gamepadControl;
        });
    }
    unsetGamepadControl(gamepadControl) {
        this.#gamepadMap.delete(gamepadControl);
    }
    /**
     * Returns an array containing the if of the control that have been defined
     *
     * @returns {number[]}
     */
    getDefinedGamepadControls() {
        return [...this.#gamepadMap.keys()];
    }
    /**
     * Returns the control currently waiting for a the user to interact with the gamepad
     *
     * @returns {number | null}
     */
    getRecording() { return this.#recordInput; }
}
export var GamepadControl;
(function (GamepadControl) {
    GamepadControl[GamepadControl["left_joystick_right_dir"] = 0] = "left_joystick_right_dir";
    GamepadControl[GamepadControl["left_joystick_left_dir"] = 1] = "left_joystick_left_dir";
    GamepadControl[GamepadControl["left_joystick_up_dir"] = 2] = "left_joystick_up_dir";
    GamepadControl[GamepadControl["left_joystick_down_dir"] = 3] = "left_joystick_down_dir";
    GamepadControl[GamepadControl["left_joystick_button"] = 4] = "left_joystick_button";
    GamepadControl[GamepadControl["left_button"] = 5] = "left_button";
    GamepadControl[GamepadControl["left_trigger"] = 6] = "left_trigger";
    GamepadControl[GamepadControl["right_joystick_right_dir"] = 7] = "right_joystick_right_dir";
    GamepadControl[GamepadControl["right_joystick_left_dir"] = 8] = "right_joystick_left_dir";
    GamepadControl[GamepadControl["right_joystick_up_dir"] = 9] = "right_joystick_up_dir";
    GamepadControl[GamepadControl["right_joystick_down_dir"] = 10] = "right_joystick_down_dir";
    GamepadControl[GamepadControl["right_joystick_button"] = 11] = "right_joystick_button";
    GamepadControl[GamepadControl["right_button"] = 12] = "right_button";
    GamepadControl[GamepadControl["right_trigger"] = 13] = "right_trigger";
    GamepadControl[GamepadControl["button_A"] = 14] = "button_A";
    GamepadControl[GamepadControl["button_B"] = 15] = "button_B";
    GamepadControl[GamepadControl["button_X"] = 16] = "button_X";
    GamepadControl[GamepadControl["button_Y"] = 17] = "button_Y";
    GamepadControl[GamepadControl["button_left_arrow"] = 18] = "button_left_arrow";
    GamepadControl[GamepadControl["button_right_arrow"] = 19] = "button_right_arrow";
    GamepadControl[GamepadControl["button_up_arrow"] = 20] = "button_up_arrow";
    GamepadControl[GamepadControl["button_down_arrow"] = 21] = "button_down_arrow";
    GamepadControl[GamepadControl["button_back"] = 22] = "button_back";
    GamepadControl[GamepadControl["button_start"] = 23] = "button_start";
    GamepadControl[GamepadControl["button_home"] = 24] = "button_home";
})(GamepadControl || (GamepadControl = {}));
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
    }
    getViewTransformMatrix() {
        let wpos = this.getWorldPosition();
        let wrot = this.getWorldRotation();
        return new Transform(wpos, wrot, this.transform.scale).getInvertMatrix();
    }
    getRange() { return Math.max(this.transform.scale.x, this.transform.scale.y); }
}
export var TrackingCameraDisableMode;
(function (TrackingCameraDisableMode) {
    TrackingCameraDisableMode[TrackingCameraDisableMode["DISABLE"] = 0] = "DISABLE";
    TrackingCameraDisableMode[TrackingCameraDisableMode["DISABLE_ONCE"] = 1] = "DISABLE_ONCE";
    TrackingCameraDisableMode[TrackingCameraDisableMode["DONT_DISABLE"] = 2] = "DONT_DISABLE";
})(TrackingCameraDisableMode || (TrackingCameraDisableMode = {}));
export class TrackingCamera extends Camera {
    /**
     * The object the camera should track, if null, stops tracking
     */
    trackedObject = null;
    /**
     * The number of second it should theorycally take to the camera to travel the current distance from the camera to the object.
     */
    trackLag = 1;
    /**
     * The minimum speed at which the camera should travel when the speed reach do to the track lag is to slow
     */
    minTrackSpeed = 1;
    autoDisableTracking = TrackingCameraDisableMode.DONT_DISABLE;
    trackedZoom = null;
    zoomTrackLag = 1;
    zoomMinTrackSpeed = 1;
    autoDisableZoomTracking = TrackingCameraDisableMode.DONT_DISABLE;
    constructor() {
        super();
        this.updateEnabled = true;
    }
    update(dt) {
        if (this.trackedObject && this.scene === this.trackedObject.scene) {
            let cameraWorldPosition = this.getWorldPosition();
            let objectWorldPosition = this.trackedObject.getWorldPosition();
            if (!cameraWorldPosition.equal(objectWorldPosition)) {
                let rawOffset = objectWorldPosition.clone().sub(cameraWorldPosition);
                let offset = rawOffset.clone().divS(this.trackLag);
                let len = offset.length();
                if (len < this.minTrackSpeed)
                    offset.normalize().multS(this.minTrackSpeed);
                offset.multS(dt);
                if (offset.length() > cameraWorldPosition.distanceTo(objectWorldPosition))
                    this.transform.translation.add(rawOffset);
                else
                    this.transform.translation.add(offset);
            }
            else {
                if (this.autoDisableTracking === TrackingCameraDisableMode.DISABLE_ONCE) {
                    this.trackedObject = null;
                    this.autoDisableTracking = TrackingCameraDisableMode.DONT_DISABLE;
                }
                else if (this.autoDisableTracking === TrackingCameraDisableMode.DISABLE)
                    this.trackedObject = null;
            }
        }
        if (this.trackedZoom) {
            if (this.transform.scale.x !== this.trackedZoom) {
                let rawZoomOffset = this.trackedZoom - this.transform.scale.x;
                let offset = rawZoomOffset / this.zoomTrackLag;
                let len = Math.abs(offset);
                if (len < this.zoomMinTrackSpeed)
                    offset = Math.sign(offset) * this.zoomMinTrackSpeed;
                offset *= dt;
                let trueDist = this.transform.scale.x - this.transform.scale.x * (1 + offset);
                if (Math.abs(trueDist) > Math.abs(rawZoomOffset))
                    this.transform.scale.set(this.trackedZoom, this.trackedZoom);
                else
                    this.transform.scale.multS(1 + offset);
            }
            else {
                if (this.autoDisableZoomTracking === TrackingCameraDisableMode.DISABLE_ONCE) {
                    this.trackedZoom = undefined;
                    this.autoDisableZoomTracking = TrackingCameraDisableMode.DONT_DISABLE;
                }
                else if (this.autoDisableZoomTracking === TrackingCameraDisableMode.DISABLE)
                    this.trackedZoom = undefined;
            }
        }
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
        img.onload = function () {
            completed.n++;
            incrementCallback(completed.n);
            if (completed.n == images.length)
                finishedCallback();
        };
        img.onerror = function (err) {
            console.error(`Could not load image "${image.name}" for source "${image.src}"`);
            console.error(err);
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
export function loadSVGs(svgs, incrementCallback, finishedCallback) {
    let bank = new Map();
    let completed = { n: 0 };
    for (let svg of svgs) {
        let data = { raw: '', image: null };
        fetch(svg.src)
            .then(res => {
            if (res.ok)
                return res.text();
            throw res;
        })
            .then(svg => {
            data.raw = svg;
            return svg;
        })
            .then(SVGStringToImage)
            .then(image => {
            data.image = image;
            completed.n++;
            incrementCallback(completed.n);
        })
            .catch(err => {
            console.error(`Could not load image "${svg.name}" for source "${svg.src}"`);
            console.error(err);
            completed.n++;
            incrementCallback(completed.n);
        })
            .finally(() => {
            if (completed.n == svgs.length)
                finishedCallback();
        });
        bank.set(svg.name, data);
    }
    if (svgs.length === 0)
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
            snd.oncanplay = function () {
                completed.n++;
                incrementCallback(completed.n);
                if (completed.n == toComplete.n)
                    finishedCallback();
            };
            snd.onerror = function (err) {
                console.error(`Could not load sound "${sound.name}" for source "${src}"`);
                console.error(err);
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
    }
}
const SpriteSheetOptions = {
    cellWidth: 16,
    cellHeight: 16,
};
export class SpriteSheet extends Drawable {
    options;
    horizontalCount;
    cursor = 0;
    loopOrigin = 0;
    tileInLoop = 1;
    savedLoop = new Map();
    constructor(image, options = SpriteSheetOptions) {
        super(image);
        this.options = { ...SpriteSheetOptions, ...options };
        this.horizontalCount = this.image.width / this.options.cellWidth;
        this.size.set(this.options.cellWidth, this.options.cellHeight);
        this.halfSize.copy(this.size).divS(2);
    }
    XYToIndex(x, y) {
        return x + y * this.horizontalCount;
    }
    indexToXY(index) {
        let x = index % this.horizontalCount;
        let y = Math.floor(index / this.horizontalCount);
        return [x, y];
    }
    saveLoop(name, loopOrigin, tileInLoop) { this.savedLoop.set(name, [loopOrigin, tileInLoop]); }
    useLoop(name, index = 0) { this.setLoop(...this.savedLoop.get(name), index); }
    isLoop(name) { return this.loopOrigin == this.savedLoop.get(name)[0]; }
    setLoop(loopOrigin, tileInLoop, startIndex = 0) {
        this.loopOrigin = loopOrigin;
        this.tileInLoop = tileInLoop;
        this.cursor = this.loopOrigin + startIndex % tileInLoop;
    }
    getLoopIndex() { return this.cursor - this.loopOrigin; }
    next() { this.cursor = this.loopOrigin + (this.getLoopIndex() + 1) % this.tileInLoop; }
    draw(ctx) {
        ctx.save();
        let x = this.cursor % this.horizontalCount;
        let y = Math.floor(this.cursor / this.horizontalCount);
        x *= this.size.x;
        y *= this.size.y;
        ctx.scale(1 / this.size.x, -1 / this.size.y);
        ctx.drawImage(this.image, x, y, this.size.x, this.size.y, -this.halfSize.x, -this.halfSize.y, this.size.x, this.size.y);
        ctx.restore();
    }
}
export class ImageManipulator extends GameObject {
    canvas;
    ctx;
    constructor(width = 1, height = 1) {
        super();
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }
    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }
    setSize(width, height) {
        let tmpcanvas = document.createElement('canvas');
        tmpcanvas.width = this.canvas.width;
        tmpcanvas.height = this.canvas.height;
        let tmpctx = tmpcanvas.getContext('2d');
        tmpctx.imageSmoothingEnabled = false;
        tmpctx.drawImage(this.canvas, 0, 0);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(tmpcanvas, 0, 0);
    }
    setPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }
    setPixelRGBA(x, y, r, g, b, a) {
        let imageData = new ImageData(1, 1);
        imageData.data.set([r, g, b, a]);
        this.ctx.putImageData(imageData, x, y);
    }
    getPixel(x, y) {
        let data = this.ctx.getImageData(x, y, 1, 1);
        return [data.data[0], data.data[1], data.data[2], data.data[3]];
    }
    print() { return this.canvas.toDataURL('image/png'); }
    download(name, addSize = false) {
        let a = document.createElement('a');
        a.href = this.print();
        a.download = `${name}${addSize ? `_${this.width}x${this.height}` : ''}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    getImage() {
        let image = document.createElement('img');
        image.src = this.print();
        return image;
    }
    toString() { return this.print(); }
    clone() {
        let im = new ImageManipulator(this.width, this.height);
        im.ctx.drawImage(this.canvas, 0, 0);
        return im;
    }
    static fromImage(image) {
        let im = new ImageManipulator(image.width, image.height);
        im.ctx.drawImage(image, 0, 0);
        return im;
    }
    draw(ctx) {
        ctx.save();
        ctx.scale(1 / this.width, -1 / this.height);
        ctx.drawImage(this.canvas, -this.width / 2, -this.height / 2);
        ctx.restore();
    }
}
export class TextureMapper {
    static map(modelIM, colorChartIM, textureIM) {
        let outputIM = new ImageManipulator(modelIM.width, modelIM.height);
        for (let x = 0; x < modelIM.width; x++)
            for (let y = 0; y < modelIM.height; y++) {
                let modelColor = modelIM.getPixel(x, y);
                if (modelColor[3] == 0)
                    continue;
                // console.log(modelColor)
                let pixelLocation = TextureMapper.#findPixelWithColorInImage(colorChartIM, ...modelColor);
                // console.log(pixelLocation)
                if (!pixelLocation)
                    continue;
                let color = textureIM.getPixel(...pixelLocation);
                // console.log(color)
                outputIM.setPixelRGBA(x, y, ...color);
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
    syncedFunctions = [];
    constructor() {
        super();
    }
    source(data) { }
    getSource() { return badclone(this); }
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
                data: this.getSource(),
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
    syncCalls(...functionsName) {
        for (let name of functionsName) {
            this.syncedFunctions.push(name);
            let func = this[name];
            this[name] = function () {
                console.log('called synced function');
                this.sendUpdate({ event: 'CALLFUNCTION', func: name, args: arguments });
                func(...arguments);
            };
        }
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
    isMine() { return this.owner === Network.id; }
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
                    else if (typeof update.data === 'object' && update.data.event === 'CALLFUNCTION') {
                        if (object.syncedFunctions.includes(message.data.func))
                            object[message.data.func](message.data.are);
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
