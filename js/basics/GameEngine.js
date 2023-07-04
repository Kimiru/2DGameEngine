import { TransformMatrix } from "../math/TransformMatrix.js";
import { Vector } from "../math/Vector.js";
import { Input } from "./Input.js";
import { loadImages, loadSounds, loadSVGs } from "./Utils.js";
const gameEngineConstructorArguments = {
    width: innerWidth,
    height: innerHeight,
    verticalPixels: 100,
    scaling: devicePixelRatio,
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
    canvas;
    /**
     * The context on which the GameEngine will draw.
     * Shall not be modified.
     */
    ctx;
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
    timeScale = 1;
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
    #resume = false;
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
        this.resize(args.width, args.height, args.scaling ?? devicePixelRatio, args.verticalPixels);
        this.#imageToLoadCount = args.images.length;
        this.#svgToLoadCount = args.svgs.length;
        this.#soundToLoadCount = args.sounds.map(e => e.srcs.length).reduce((a, b) => a + b, 0);
        this.imageBank = loadImages(args.images ?? [], (n) => { this.#loadedImagesCount = n; }, () => {
            this.#locks[0] = false;
            this.#checkLocks();
        });
        this.soundBank = loadSounds(args.sounds ?? [], (n) => { this.#loadedSoundCount = n; }, () => {
            this.#locks[1] = false;
            this.#checkLocks();
        });
        this.svgBank = loadSVGs(args.svgs ?? [], (n) => { this.#loadedSVGCount = n; }, () => {
            this.#locks[2] = false;
            this.#checkLocks();
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                if (this.#run) {
                    this.#resume = true;
                    this.stop();
                }
                else
                    this.#resume = false;
            }
            else {
                if (this.#resume) {
                    this.#resume = false;
                    this.#lastTime = Date.now();
                    this.start();
                }
            }
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
                this.#currentScene.engine = this;
                this.#currentScene.onSet();
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
        this.#dt = Math.min(this.#dt, 0.05) * this.timeScale;
        this.ctx.clearRect(0, 0, this.#trueWidth, this.trueHeight);
        this.ctx.save();
        this.ctx.translate(this.trueWidth / 2, this.trueHeight / 2);
        this.ctx.scale(this.#ratio, -this.#ratio);
        if (this.#currentScene) {
            this.#currentScene.executeUpdate(this.#dt);
            this.#currentScene.executePhysics(this.#dt);
            this.#currentScene.executeDraw(this.ctx);
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
    return handler;
}
export function fillCanvasParent(engine) {
    let verticalPixels = engine.verticalPixels;
    const handler = () => {
        let canvas = engine.canvas;
        let parent = canvas.parentElement;
        let width = parent.clientWidth;
        let height = parent.clientHeight;
        if (document.fullscreenElement === canvas) {
            width = innerWidth;
            height = innerHeight;
        }
        if (height < width)
            engine.resize(width, height, devicePixelRatio, verticalPixels);
        else {
            const ratio = height / width;
            const adaptedVerticalPixels = verticalPixels * ratio;
            engine.resize(width, height, devicePixelRatio, adaptedVerticalPixels);
        }
    };
    window.addEventListener('resize', handler);
    handler();
    return handler;
}
