import { Vector } from "../math/Vector.js";
type GamepadControlAccess = {
    type: string;
    index: number;
    inverted: boolean;
};
export declare enum GamepadControl {
    left_joystick_right_dir = 0,
    left_joystick_left_dir = 1,
    left_joystick_up_dir = 2,
    left_joystick_down_dir = 3,
    left_joystick_button = 4,
    left_button = 5,
    left_trigger = 6,
    right_joystick_right_dir = 7,
    right_joystick_left_dir = 8,
    right_joystick_up_dir = 9,
    right_joystick_down_dir = 10,
    right_joystick_button = 11,
    right_button = 12,
    right_trigger = 13,
    button_A = 14,
    button_B = 15,
    button_X = 16,
    button_Y = 17,
    button_left_arrow = 18,
    button_right_arrow = 19,
    button_up_arrow = 20,
    button_down_arrow = 21,
    button_back = 22,
    button_start = 23,
    button_home = 24
}
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
    getGamepadControlAccess(gamepadControl: GamepadControl): GamepadControlAccess;
    gamepadLoop(): void;
    recordGamepadControl(gamepadControl: GamepadControl): Promise<void>;
    unsetGamepadControl(gamepadControl: GamepadControl): void;
    /**
     * Returns an array containing the if of the control that have been defined
     *
     * @returns {number[]}
     */
    getDefinedGamepadControls(): GamepadControl[];
    /**
     * Returns the control currently waiting for a the user to interact with the gamepad
     *
     * @returns {number | null}
     */
    getRecording(): GamepadControl | null;
}
export {};
