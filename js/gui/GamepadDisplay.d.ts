import { GameObject } from "../basics/GameObject.js";
declare class InputButton extends GameObject {
    button: string;
    text: string;
    constructor(button: string, text: string);
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
declare class JoystickDisplay extends GameObject {
    joystick: string;
    constructor(joystick: string);
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class GamepadDisplay extends GameObject {
    leftJoystick: JoystickDisplay;
    rightJoystick: JoystickDisplay;
    buttonLeft: InputButton;
    buttonRight: InputButton;
    triggerLeft: InputButton;
    triggerRight: InputButton;
    up: InputButton;
    down: InputButton;
    left: InputButton;
    right: InputButton;
    A: InputButton;
    B: InputButton;
    X: InputButton;
    Y: InputButton;
    back: InputButton;
    home: InputButton;
    start: InputButton;
    calibrationMessage: string;
    noController: string;
    constructor(calibrationMessage: string, noController: string);
    states: number[];
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export {};
