import { Vector, matrix, Transform } from './2DGEMath.js';
/**
 * GameEngine is the class responsible for the execution of the game loop, the canvas and resize change, and the scene management
 */
export declare class GameEngine {
    #private;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    input: Input;
    imageBank: Map<string, HTMLImageElement>;
    soundBank: Map<string, Sound>;
    /**
     * Create a new game engine using the given argument list, filling the gap with default value
     *
     * @param {width: number, height: number, verticalPixels: number, scaling: number, images: Image[]} args
     */
    constructor(args?: {
        width: number;
        height: number;
        verticalPixels: number;
        scaling: number;
        canvas: HTMLCanvasElement;
        images: {
            name: string;
            src: string;
        }[];
        sounds: {
            name: string;
            srcs: string[];
        }[];
    });
    get trueWidth(): number;
    get trueHeight(): number;
    get usableWidth(): number;
    get usableHeight(): number;
    get usableScale(): Vector;
    get dt(): number;
    get scene(): GameScene;
    /**
     * update the size of both canvas
     * if a scene is curently used, update it's camera
     *
     * @param {number} width
     * @param {number} height
     */
    resize(width: number, height: number, scaling?: number, pixels?: number): void;
    /**
     * Set the number vertical virtual pixel.
     * i.e. if a 1x1 square is drawn, it will take 1/pixels the space
     *
     * @param {number} pixels
     */
    setVerticalPixels(pixels?: number): void;
    /**
     * Set the new scene to be displayed, can be null
     *
     * @param {GameScene | null} scene
     */
    setScene(scene: GameScene): void;
    /**
     * Start the engine, running the gameloop
     */
    start(): void;
    /**
     * Stop the engine, stopping the gameloop
     */
    stop(): void;
    onResourcesLoaded(callback: any): void;
}
export declare function fullScreenResizeHandler(verticalPixels: number, engine: GameEngine): () => void;
export declare class RenderingStyle {
    static INFINITY: number;
    static IN_VIEW: number;
}
/**
 * GameScene is the class responsible for all the scene related operation such as camera definition, object adding, object grouping, scene update and rendering.
 * GameScene id is not used for scene unicity but for scene sorting regarding Network.
 * If you need multiple instance of the same scene, make sure ids are different but deterministic.
 * The deteministic side is needed when working with the Network
 * It is recommended to instanciate all your scene at the beginning if possible
 */
export declare class GameScene {
    static list: Map<string, GameScene>;
    id: string;
    tags: Map<string, GameObject[]>;
    children: GameObject[];
    camera: Camera;
    engine: GameEngine;
    renderingStyle: number;
    /**
     * Create a new empty GameScene
     */
    constructor();
    store(): void;
    /**
     * Update the scene and its child
     * Is called by the GameEngine to update the scene
     * Should not be called by the user
     *
     * @param {number} dt
     */
    executeUpdate(dt: number): void;
    executePhysics(dt: number): void;
    childrenDrawFilter(children: GameObject[]): GameObject[];
    /**
     * Draw the scene and its children (children first)
     * Is called by the GameEngine to draw the scene
     * Should not be called by the user
     *
     * @param ctx
     */
    executeDraw(ctx: CanvasRenderingContext2D): void;
    /**
     * Add one or more object to the scene sorting them out by their tages, removing them from previous parent/scene if needed
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    add(...object: GameObject[]): this;
    /**
     * Sort the given objects and their children by their tags
     * Should not be called by the user
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    addTags(...object: GameObject[]): this;
    /**
     * Remove one or more from the scene, object should be in the scene
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    remove(...object: GameObject[]): this;
    /**
     * Remove the given objects and their children from the tag sorting lists
     * Should not be called by the user
     *
     * @param {...GameObject} object
     * @returns {this}
     */
    removeTags(...object: GameObject[]): this;
    /**
     * Get an immutable array of all the object using the given tag
     *
     * @param {string} tag
     * @returns {GameObject[]}
     */
    getTags(tag: string): GameObject[];
    /**
     * Is called when the scene is set to a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onSet(): void;
    /**
     * Is called when the scene is unset from a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     */
    onUnSet(): void;
    /**
     * Is called when the canvas viewport changes when used by a GameEngine
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} width
     * @param {number} height
     */
    onResize(width: number, height: number): void;
    /**
     * Update the scene specific operation
     *
     * Is called when the scene is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    update(dt: number): void;
    /**
     * Update the scene physics specific operation
     *
     * Is called when the scene physics is updated
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {number} dt
     */
    physics(dt: number): void;
    /**
     * Draw the scene specific element
     *
     * Is called when the scene is drawn
     * Is to be modified by the user
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx: CanvasRenderingContext2D): void;
}
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
    renderingStyle: number;
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
    get engine(): GameEngine;
    /**
     * @returns {Input}
     */
    get input(): Input;
    /**
     * Return true if object is either in a scene or has a parent object
     */
    get used(): boolean;
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
    /**
    * Update the object and its child.
    * Is called by the Scene or parent objects to update this object.
    * Should not be called by the user.
    *
    * @param {number} dt
    */
    executeUpdate(dt: number): void;
    executePhysics(dt: number): void;
    childrenDrawFilter(children: GameObject[]): GameObject[];
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
/**
 * The Timer class is used to mesure time easily
 */
export declare class Timer {
    begin: number;
    /**
     * Create a new timer starting from now or a given setpoint
     *
     * @param time
     */
    constructor(time?: number);
    /**
     * Reset the timer
     */
    reset(): void;
    /**
     * Return the amount of time in ms since the timer was last reset
     */
    getTime(): number;
    /**
     * Return true if the time since the last reset is greather that the given amount in ms
     *
     * @param {number} amount in ms
     */
    greaterThan(amount: number): boolean;
    /**
     * Return true if the time since the last reset is less that the given amount in ms
     *
     * @param {number} amount
     */
    lessThan(amount: number): boolean;
}
type GamepadControlAccess = {
    type: string;
    index: number;
    inverted: boolean;
};
/**
 * The Input class is used to register keyboard input, and mouse input if linked to an element
 */
export declare class Input {
    #private;
    constructor();
    /**
     * Return true if the given char is down
     *
     * @param {string} char
     * @returns {boolean}
     */
    isCharDown(char: string): boolean;
    /**
     * return true once if the given char is down, must be repressed to return true again
     *
     * @param {string} code
     * @returns {boolean}
     */
    isCharPressed(char: string): boolean;
    /**
     * Return true if the given key is down
     *
     * @param {string} code
     * @returns {boolean}
     */
    isDown(code: string): boolean;
    /**
     * return true once if the given key is down, must be repressed to return true again
     *
     * @param {string} code
     * @returns {boolean}
     */
    isPressed(code: string): boolean;
    positionAdapter: (vector: Vector) => Vector;
    /**
     * Returns an instant of the mouse, click field if true will be available for one frame only
     */
    get mouse(): {
        left: boolean;
        middle: boolean;
        right: boolean;
        leftClick: boolean;
        middleClick: boolean;
        rightClick: boolean;
        position: Vector;
        scroll: number;
        in: boolean;
    };
    /**
     * Bind the input object to an html element, a position adapter function can be passed to convert the 0 to 1 default output to a preferable unit
     *
     * @param {HTMLElement} element
     * @param {(vector:Vector)=>Vector} positionAdapter
     */
    bindMouse(element: HTMLCanvasElement, positionAdapter?: (vector: Vector) => Vector): void;
    mouseLoop(): void;
    deadPoint: number;
    get isGamepadCalibrating(): boolean;
    get gamepad(): {
        left_joystick: Vector;
        left_joystick_right_dir: number;
        left_joystick_left_dir: number;
        left_joystick_up_dir: number;
        left_joystick_down_dir: number;
        left_joystick_button: number;
        left_button: number;
        left_trigger: number;
        right_joystick: Vector;
        right_joystick_right_dir: number;
        right_joystick_left_dir: number;
        right_joystick_up_dir: number;
        right_joystick_down_dir: number;
        right_joystick_button: number;
        right_button: number;
        right_trigger: number;
        button_A: number;
        button_B: number;
        button_X: number;
        button_Y: number;
        button_left_arrow: number;
        button_right_arrow: number;
        button_up_arrow: number;
        button_down_arrow: number;
        button_back: number;
        button_start: number;
        button_home: number;
        is_calibrating: boolean;
        is_calibrated: boolean;
        has_gamepad: boolean;
    };
    /**
     * Start the process of calibrating the axes of the connected controller.
     * This includes but is not limited to: Joysticks, Triggers, Cross buttons...
     *
     * @param {(axesStates: number[]) => void | null} updateCallback
     * @returns {Promise<void>}
     */
    calibrateGamepad(updateCallback?: (axesStates: number[]) => void): Promise<void>;
    getGamepadControlAccess(gamepadControl: number): GamepadControlAccess;
    gamepadLoop(): void;
    recordGamepadControl(gamepadControl: number): Promise<void>;
    unsetGamepadControl(gamepadControl: number): void;
    /**
     * Returns an array containing the if of the control that have been defined
     *
     * @returns {number[]}
     */
    getDefinedGamepadControls(): number[];
    /**
     * Returns the control currently waiting for a the user to interact with the gamepad
     *
     * @returns {number | null}
     */
    getRecording(): number | null;
}
export declare class GamepadControl {
    #private;
    static left_joystick_right_dir: number;
    static left_joystick_left_dir: number;
    static left_joystick_up_dir: number;
    static left_joystick_down_dir: number;
    static left_joystick_button: number;
    static left_button: number;
    static left_trigger: number;
    static right_joystick_right_dir: number;
    static right_joystick_left_dir: number;
    static right_joystick_up_dir: number;
    static right_joystick_down_dir: number;
    static right_joystick_button: number;
    static right_button: number;
    static right_trigger: number;
    static button_A: number;
    static button_B: number;
    static button_X: number;
    static button_Y: number;
    static button_left_arrow: number;
    static button_right_arrow: number;
    static button_up_arrow: number;
    static button_down_arrow: number;
    static button_back: number;
    static button_start: number;
    static button_home: number;
}
/**
 * The Camera class is used to set the center of the view inside a scene
 */
export declare class Camera extends GameObject {
    /**
     * Create a new Camera object
     */
    constructor();
    getViewTransformMatrix(): matrix;
    getRange(): number;
}
export declare class TrackingCamera extends Camera {
    trackedObject: GameObject;
    trackLag: number;
    minTrack: number;
    constructor();
    update(dt: number): void;
}
/**
 * loads multiple images and use callbacks for progression checks and at the end
 *
 * @param {{ name: string, src: string }[]} images
 * @param {(completed:number) => void} incrementCallback
 * @param {() => void}finishedCallback
 * @returns
 */
export declare function loadImages(images: {
    name: string;
    src: string;
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, HTMLImageElement>;
declare class Sound {
    sounds: HTMLAudioElement[];
    volume: number;
    currentSound: HTMLAudioElement;
    constructor(sounds: HTMLAudioElement[]);
    play(): void;
    setVolume(volume: number): void;
}
export declare function loadSounds(sounds: {
    name: string;
    srcs: string[];
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, Sound>;
export declare class Drawable extends GameObject {
    image: HTMLImageElement;
    size: Vector;
    halfSize: Vector;
    constructor(image: any);
    draw(ctx: CanvasRenderingContext2D): void;
}
declare const SpriteSheetOptions: {
    cellWidth: number;
    cellHeight: number;
};
export declare class SpriteSheet extends Drawable {
    options: typeof SpriteSheetOptions;
    horizontalCount: number;
    cursor: number;
    loopOrigin: number;
    tileInLoop: number;
    savedLoop: Map<string, [number, number]>;
    constructor(image: HTMLImageElement, options?: typeof SpriteSheetOptions);
    XYToIndex(x: number, y: number): number;
    indexToXY(index: any): [number, number];
    saveLoop(name: string, loopOrigin: number, tileInLoop: number): void;
    useLoop(name: string, index?: number): void;
    isLoop(name: string): boolean;
    setLoop(loopOrigin: number, tileInLoop: number, startIndex?: number): void;
    getLoopIndex(): number;
    next(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class ImageManipulator extends GameObject {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    constructor(width?: number, height?: number);
    get width(): number;
    get height(): number;
    setSize(width: number, height: number): void;
    setPixel(x: number, y: number, color: string): void;
    setPixelRGBA(x: number, y: number, r: number, g: number, b: number, a: number): void;
    getPixel(x: number, y: number): [number, number, number, number];
    print(): string;
    download(name: string, addSize?: boolean): void;
    getImage(): HTMLImageElement;
    toString(): string;
    clone(): ImageManipulator;
    static fromImage(image: HTMLImageElement): ImageManipulator;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class TextureMapper {
    #private;
    static map(modelIM: ImageManipulator, colorChartIM: ImageManipulator, textureIM: ImageManipulator): ImageManipulator;
    static downloadStandardColorChart(width: number, height: number): void;
}
export declare class NetworkGameObject extends GameObject {
    static list: Map<string, Map<number, NetworkGameObject>>;
    static inherited: Map<string, new () => NetworkGameObject>;
    static pendingUpdates: any[];
    static inherit(): void;
    static build(instruction: {
        data: any;
        proto: string;
    }): NetworkGameObject;
    static register(object: NetworkGameObject, owner: string, id: number): void;
    static getRegistered(owner: string): NetworkGameObject[];
    static getRegisteredObject(owner: string, id: number): NetworkGameObject;
    static isRegistered(owner: string, id: number): boolean;
    static flushPendingUpdates(): void;
    static hasPendingUpdates(): boolean;
    secID: number;
    synced: boolean;
    owner: string;
    syncedFunctions: string[];
    constructor();
    source(data: any): void;
    getSource(): any;
    sync(): void;
    syncCalls(...functionsName: string[]): void;
    sendUpdate(data: any): void;
    recvUpdate(data: any): void;
    syncMoveToObject(owner: string, id: number): void;
    syncMoveToScene(scene: string): void;
    syncKill(): void;
    isMine(): boolean;
}
export {};
