import { Timer } from "../math/Timer.js"
import { map } from "../math/Utils.js"
import { Vector } from "../math/Vector.js"
import { range } from "./Utils.js"

type GamepadControlAccess = {
    type: string,
    index: number,
    inverted: boolean
}

export enum GamepadControl {

    left_joystick_right_dir,
    left_joystick_left_dir,
    left_joystick_up_dir,
    left_joystick_down_dir,
    left_joystick_button,

    left_button,
    left_trigger,

    right_joystick_right_dir,
    right_joystick_left_dir,
    right_joystick_up_dir,
    right_joystick_down_dir,
    right_joystick_button,

    right_button,
    right_trigger,

    button_A,
    button_B,
    button_X,
    button_Y,

    button_left_arrow,
    button_right_arrow,
    button_up_arrow,
    button_down_arrow,

    button_back,
    button_start,
    button_home

}

/**
 * The Input class is used to register keyboard input, and mouse input if linked to an element
 */
export class Input {

    #keylock: string = null

    #charDown: Set<string> = new Set()
    #charOnce: Set<string> = new Set()
    #keysDown: Set<string> = new Set()
    #keysOnce: Set<string> = new Set()

    constructor() {

        window.addEventListener('keydown', (evt) => {

            this.#charDown.add(evt.key)
            this.#charOnce.add(evt.key)
            this.#keysDown.add(evt.code)
            this.#keysOnce.add(evt.code)

        })

        window.addEventListener('keyup', (evt) => {

            this.#charDown.delete(evt.key)
            this.#charOnce.delete(evt.key)
            this.#keysDown.delete(evt.code)
            this.#keysOnce.delete(evt.code)

        })

    }

    lock(lock: string = '') {

        if (this.#keylock) return

        this.#keylock = lock

    }

    unlock(lock: string = '') {

        if (this.#keylock !== lock) return

        this.#keylock = null

    }

    /**
     * Return true if the given char is down
     * 
     * @param {string} char 
     * @returns {boolean}
     */
    isCharDown(char: string, lock?: string): boolean {

        if (this.#keylock && this.#keylock !== lock) return false

        return this.#charDown.has(char)

    }

    /**
     * return true once if the given char is down, must be repressed to return true again
     * 
     * @param {string} code 
     * @returns {boolean}
     */
    isCharPressed(char: string, lock?: string): boolean {

        if (this.#keylock && this.#keylock !== lock) return false

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
    isDown(code: string, lock?: string): boolean {

        if (this.#keylock && this.#keylock !== lock) return false

        return this.#keysDown.has(code)

    }

    /**
     * return true once if the given key is down, must be repressed to return true again
     * 
     * @param {string} code 
     * @returns {boolean}
     */
    isPressed(code: string, lock?: string): boolean {

        if (this.#keylock && this.#keylock !== lock) return false

        if (this.#keysOnce.has(code)) {

            this.#keysOnce.delete(code)

            return true

        }

        return false

    }

    // Mouse

    #bindedElement: HTMLCanvasElement
    #mouseButtons: [boolean, boolean, boolean] = [false, false, false]
    #mousePosition: Vector = new Vector()
    #trueMousePosition: Vector = new Vector()
    #mouseIn: boolean = false
    #mouseClick: [boolean, boolean, boolean] = [false, false, false]
    #mouseScroll: number = 0
    positionAdapter = function (vector: Vector) { return vector }

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
        position: Vector,
        scroll: number,
        in: boolean
    } {
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
        }

        return result
    }

    /**
     * Bind the input object to an html element, a position adapter function can be passed to convert the 0 to 1 default output to a preferable unit
     * 
     * @param {HTMLElement} element 
     * @param {(vector:Vector)=>Vector} positionAdapter 
     */
    bindMouse(element: HTMLCanvasElement, positionAdapter = function (vector: Vector) { return vector }) {

        this.positionAdapter = positionAdapter
        this.#bindedElement = element

        element.addEventListener('contextmenu', evt => evt.preventDefault())

        element.addEventListener('mousedown', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseup', this.#handleMouseEvent.bind(this))
        element.addEventListener('mousemove', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseleave', this.#handleMouseEvent.bind(this))
        element.addEventListener('mouseenter', this.#handleMouseEvent.bind(this))
        element.addEventListener('wheel', this.#handleMouseEvent.bind(this))

    }

    mouseLoop() {

        this.#to01()

        for (let index = 0; index < 3; index++)
            this.#mouseClick[index] = false

        this.#mouseScroll = 0

    }

    /**
     * Handle the mouse related operations
     * 
     * @param {MouseEvent} evt 
     */
    #handleMouseEvent(evt: MouseEvent): void {

        let prev: [boolean, boolean, boolean] = [this.#mouseButtons[0], this.#mouseButtons[1], this.#mouseButtons[2]]

        this.#handleButtons(evt.buttons)
        this.#mousePosition.set(evt.offsetX, evt.offsetY)
        this.#mouseIn = this.#mousePosition.x > 0 && this.#mousePosition.x < 1 &&
            this.#mousePosition.y > 0 && this.#mousePosition.y < 1


        for (let index = 0; index < 3; index++)
            if (!this.#mouseButtons[index] && prev[index])
                this.#mouseClick[index] = true

        if (evt instanceof WheelEvent)
            this.#mouseScroll += Math.sign(evt.deltaY)

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
                break
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
                break
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
                break
        }

    }

    /**
     * convert the position from the html element size to the 0-1 scale
     * 
     * @param evt 
     * @returns 
     */
    #to01(): void {

        this.#trueMousePosition = this.positionAdapter(this.#mousePosition
            .clone()
            .div(new Vector(this.#bindedElement.offsetWidth, this.#bindedElement.offsetHeight, 1))
        )
    }


    // Gamepad

    #gamepadMap: Map<GamepadControl, GamepadControlAccess> = new Map()

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
    }

    #calibrated: boolean = false
    deadPoint = .1
    #recordInput: GamepadControl = null
    #recordOK: () => void = null
    #recordKO: (gamepadControl: GamepadControl) => void = null

    #gamepadCalibration: {
        ok: () => void,
        update: (axesStates: number[]) => void,
        axesStates: number[],
        axesTimer: { timer: Timer, value: number }[]
    } = null

    #axesDefaultValue: number[] = null

    get isGamepadCalibrating(): boolean { return this.#gamepadCalibration !== null }

    get gamepad(): {
        left_joystick: Vector,
        left_joystick_right_dir: number,
        left_joystick_left_dir: number,
        left_joystick_up_dir: number,
        left_joystick_down_dir: number,
        left_joystick_button: number,
        left_button: number,
        left_trigger: number,
        right_joystick: Vector,
        right_joystick_right_dir: number,
        right_joystick_left_dir: number,
        right_joystick_up_dir: number,
        right_joystick_down_dir: number,
        right_joystick_button: number,
        right_button: number,
        right_trigger: number,
        button_A: number,
        button_B: number,
        button_X: number,
        button_Y: number,
        button_left_arrow: number,
        button_right_arrow: number,
        button_up_arrow: number,
        button_down_arrow: number,
        button_back: number,
        button_start: number,
        button_home: number,
        is_calibrating: boolean,
        is_calibrated: boolean,
        has_gamepad: boolean
    } {

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
            has_gamepad: navigator.getGamepads?.().length != 0 ?? false
        }

    }

    #getCorrectedAxisValue(gamepad: Gamepad, index: number): number {


        let defaultValue = this.#axesDefaultValue[index]

        let value = gamepad.axes[index]

        if (defaultValue !== 0) {

            if (defaultValue < 0)
                value = map(value, defaultValue, 1, 0, 1)

            else
                value = map(value, defaultValue, -1, 0, 1)

        }

        return value

    }

    // Calibreation

    /**
     * Start the process of calibrating the axes of the connected controller.
     * This includes but is not limited to: Joysticks, Triggers, Cross buttons...
     * 
     * @param {(axesStates: number[]) => void | null} updateCallback 
     * @returns {Promise<void>}
     */
    calibrateGamepad(updateCallback: (axesStates: number[]) => void = null): Promise<void> {

        return new Promise((ok, ko) => {

            this.#gamepadCalibration = {

                ok: ok,
                update: updateCallback,
                axesStates: null,
                axesTimer: null,

            }

        })

    }

    #setupCalibration(gamepad: Gamepad) {

        let axesCount = gamepad.axes.length

        this.#gamepadCalibration.axesStates = []
        this.#gamepadCalibration.axesTimer = []

        this.#axesDefaultValue = []

        for (let i of range(axesCount)) {

            this.#gamepadCalibration.axesStates.push(0)
            this.#gamepadCalibration.axesTimer.push({ timer: new Timer(), value: 0 })

            this.#axesDefaultValue.push(0)

        }

    }

    #pickupAxesForCalibration(gamepad: Gamepad) {

        this.#getAllCurrentGamepadInputs(gamepad)
            .filter(entry => entry.type === 'axes')
            .filter(entry => this.#gamepadCalibration.axesStates[entry.index] === 0)
            .forEach(entry => {
                this.#gamepadCalibration.axesStates[entry.index]++
                this.#gamepadCalibration.axesTimer[entry.index].timer.reset()
                this.#gamepadCalibration.update?.([...this.#gamepadCalibration.axesStates])
            })

    }

    #calibratePickedupAxes(gamepad: Gamepad): void {

        let axesCalibrating = this.#gamepadCalibration.axesStates
            .map((entry, index) => entry === 1 ? index : -1)
            .filter(entry => entry !== -1)

        for (let axisIndex of axesCalibrating) {

            let axisValue = gamepad.axes[axisIndex]

            if (Math.abs(axisValue) < this.deadPoint) axisValue = 0

            let axis = this.#gamepadCalibration.axesTimer[axisIndex]

            if (axis.value !== axisValue) {

                axis.timer.reset()
                axis.value = axisValue

            } else
                if (axis.timer.greaterThan(2000)) {

                    this.#gamepadCalibration.axesStates[axisIndex]++
                    this.#axesDefaultValue[axisIndex] = axisValue

                    this.#gamepadCalibration.update?.([...this.#gamepadCalibration.axesStates])

                }

        }

        if (this.#gamepadCalibration.axesStates.every(entry => entry === 2)) {

            this.#gamepadCalibration.ok()
            this.#gamepadCalibration = null
            this.#calibrated = true

        }

    }

    #calibrationLoop(gamepad: Gamepad): void {

        if (this.#gamepadCalibration && this.#gamepadCalibration.axesStates === null)
            this.#setupCalibration(gamepad)

        this.#pickupAxesForCalibration(gamepad)
        this.#calibratePickedupAxes(gamepad)

    }

    // Record Controls


    getGamepadControlAccess(gamepadControl: GamepadControl): GamepadControlAccess {

        let gca = this.#gamepadMap.get(gamepadControl)

        return gca ? { ...gca } : undefined

    }

    #getAllCurrentGamepadInputs(gamepad: Gamepad) {

        let axisInput = gamepad.axes
            .map((axe, index) => {
                axe = this.#getCorrectedAxisValue(gamepad, index)
                return { data: { type: 'axes', index, inverted: axe < 0 }, value: Math.abs(axe) }
            })
            .filter(entry => entry.value > .5)
            .map(entry => entry.data)

        let buttonsInput = gamepad.buttons
            .map((button, index) => ({ data: { type: 'buttons', index, inverted: button.value < 0 }, value: Math.abs(button.value) }))
            .filter(entry => entry.value > .5)
            .map(entry => entry.data)

        return [...axisInput, ...buttonsInput]

    }

    #recordLoop(gamepad: Gamepad): void {

        let input = this.#getAllCurrentGamepadInputs(gamepad)[0]

        if (input) {

            let duplicate = [...this.#gamepadMap.entries()].find(([_, entry]) => entry.type === input.type && entry.index === input.index && entry.inverted === input.inverted)

            if (duplicate)
                this.#recordKO(duplicate[0])

            else {

                this.#gamepadMap.set(this.#recordInput, input)
                this.#recordOK()

            }

            this.#recordInput = this.#recordOK = this.#recordKO = null

        }


    }

    #processGamepadControl(gamepad: Gamepad, gamepadControl: GamepadControl): number {

        let gamepadControlAccess = this.#gamepadMap.get(gamepadControl)
        if (!gamepadControlAccess) return 0

        let value: number = 0

        if (gamepadControlAccess.type === 'axes')
            value = this.#getCorrectedAxisValue(gamepad, gamepadControlAccess.index)
        else
            value = gamepad.buttons[gamepadControlAccess.index].value
        if (Math.abs(value) < this.deadPoint) value = 0
        if (gamepadControlAccess.inverted) value *= -1

        return 0 > value ? 0 : value

    }

    #gamepadInputUpdateLoop(gamepad: Gamepad): void {

        for (let key of Object.keys(GamepadControl))

            this.#gamepad[key] = this.#processGamepadControl(gamepad, GamepadControl[key])

        this.#gamepad.left_joystick.set(
            this.#gamepad.left_joystick_right_dir - this.#gamepad.left_joystick_left_dir,
            this.#gamepad.left_joystick_up_dir - this.#gamepad.left_joystick_down_dir
        )

        this.#gamepad.right_joystick.set(
            this.#gamepad.right_joystick_right_dir - this.#gamepad.right_joystick_left_dir,
            this.#gamepad.right_joystick_up_dir - this.#gamepad.right_joystick_down_dir
        )

    }

    gamepadLoop(): void {

        let gamepad = navigator.getGamepads?.()[0] ?? null

        if (!gamepad) return

        if (!this.#axesDefaultValue)
            this.#axesDefaultValue = new Array().fill(0, 0, gamepad.axes.length)

        if (this.isGamepadCalibrating)
            this.#calibrationLoop(gamepad)

        if (this.#recordOK)
            this.#recordLoop(gamepad)

        this.#gamepadInputUpdateLoop(gamepad)

    }

    recordGamepadControl(gamepadControl: GamepadControl): Promise<void> {

        return new Promise((ok, ko) => {

            this.#gamepadMap.delete(gamepadControl)

            this.#recordOK = ok
            this.#recordKO = ko
            this.#recordInput = gamepadControl

        })

    }

    unsetGamepadControl(gamepadControl: GamepadControl) {

        this.#gamepadMap.delete(gamepadControl)

    }

    /**
     * Returns an array containing the if of the control that have been defined
     * 
     * @returns {number[]}
     */
    getDefinedGamepadControls(): GamepadControl[] {

        return [...this.#gamepadMap.keys()]

    }

    /**
     * Returns the control currently waiting for a the user to interact with the gamepad
     * 
     * @returns {number | null}
     */
    getRecording(): GamepadControl | null { return this.#recordInput }

}

