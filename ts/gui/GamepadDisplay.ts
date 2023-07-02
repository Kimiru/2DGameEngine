import { GameObject } from "../basics/GameObject.js"
import { GamepadControl } from "../basics/Input.js"
import { TransformMatrix } from "../math/TransformMatrix.js"
import { map } from "../math/Utils.js"
import { Vector } from "../math/Vector.js"

const minRange = .2

class InputButton extends GameObject {

    button: string = 'left_button'
    text: string = 'LB'

    constructor(button: string, text: string) {

        super()

        this.button = button
        this.text = text

        this.transform.scale.set(.1, .1)

    }

    update(dt: number): void {

        let input = this.input!

        let mouse = input.mouse

        if (mouse.leftClick) {

            if (input.getRecording()) return

            let wtm = this.getWorldTransformMatrix()

            let myPosition = TransformMatrix.multVec(wtm, new Vector())
            let range = TransformMatrix.multVec(wtm, new Vector(.5, 0)).distanceTo(myPosition)

            let delta = mouse.position.clone().sub(myPosition)
            let mouseToCenter = delta.length()

            if (mouseToCenter < range) {

                if (input.getGamepadControlAccess(GamepadControl[this.button]))
                    input.unsetGamepadControl(GamepadControl[this.button])
                else
                    input.recordGamepadControl(GamepadControl[this.button])

            }

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        let input = this.input!

        let gamepad = input.gamepad
        let defined = input.getDefinedGamepadControls()
        let recording = input.getRecording()

        ctx.strokeStyle = 'black'
        ctx.fillStyle = '#30303030'

        ctx.beginPath()
        ctx.arc(0, 0, .5, 0, 2 * Math.PI)
        ctx.fill()

        let button = GamepadControl[this.button]

        if (defined.includes(button)) {

            let range = map(gamepad[this.button], 0, 1, 0, .5)

            ctx.fillStyle = '#00ff00'

            ctx.beginPath()
            ctx.arc(0, 0, range, 0, Math.PI * 2, true)
            ctx.fill()

        } else {

            if (recording === button)
                ctx.fillStyle = '#0000ff30'
            else
                ctx.fillStyle = '#ff000030'

            ctx.beginPath()
            ctx.arc(0, 0, .5, 0, Math.PI * 2, true)
            ctx.fill()

        }

        ctx.strokeStyle = 'black'
        ctx.fillStyle = '#30303030'

        ctx.lineWidth = .025
        ctx.beginPath()
        ctx.arc(0, 0, .5, 0, 2 * Math.PI)
        ctx.stroke()

        ctx.save()
        ctx.scale(.5, -.5)
        ctx.fillStyle = 'black'
        ctx.font = '1px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.text, 0, 0)
        ctx.restore()

    }

}

class JoystickDisplay extends GameObject {

    joystick = 'left_joystick'

    constructor(joystick: string) {

        super()

        this.joystick = joystick

        this.transform.scale.set(.2, .2)

    }

    update(dt: number) {

        let input = this.input!

        let mouse = input.mouse

        if (mouse.leftClick) {

            if (input.getRecording()) return

            let wtm = this.getWorldTransformMatrix()

            let myPosition = TransformMatrix.multVec(wtm, new Vector())
            let range = TransformMatrix.multVec(wtm, new Vector(.5, 0)).distanceTo(myPosition)

            let delta = mouse.position.clone().sub(myPosition)
            let mouseToCenter = delta.length()

            if (mouseToCenter < range) {

                if (mouseToCenter > range * minRange) {

                    let control = -1

                    if (Math.abs(delta.x) > Math.abs(delta.y))

                        if (delta.x > 0)
                            control = GamepadControl[`${this.joystick}_right_dir`]
                        else
                            control = GamepadControl[`${this.joystick}_left_dir`]

                    else
                        if (delta.y > 0)
                            control = GamepadControl[`${this.joystick}_up_dir`]
                        else
                            control = GamepadControl[`${this.joystick}_down_dir`]

                    if (input.getGamepadControlAccess(control))
                        input.unsetGamepadControl(control)
                    else
                        input.recordGamepadControl(control)

                } else {

                    if (input.getGamepadControlAccess(GamepadControl[`${this.joystick}_button`]))
                        input.unsetGamepadControl(GamepadControl[`${this.joystick}_button`])
                    else
                        input.recordGamepadControl(GamepadControl[`${this.joystick}_button`])

                }

            }

        }


    }

    draw(ctx: CanvasRenderingContext2D) {

        let input = this.input!
        let gamepad = input.gamepad
        let defined = input.getDefinedGamepadControls()
        let recording = input.getRecording()

        ctx.strokeStyle = 'black'
        ctx.fillStyle = '#30303030'

        ctx.beginPath()
        ctx.arc(0, 0, .5, 0, 2 * Math.PI)
        ctx.fill()

        let right = GamepadControl[`${this.joystick}_right_dir`]
        if (defined.includes(right)) {

            let range = map(gamepad[`${this.joystick}_right_dir`], 0, 1, minRange, .5)

            ctx.fillStyle = '#00ff00'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, Math.PI / 4, -Math.PI / 4, true)
            ctx.arc(0, 0, range, -Math.PI / 4, Math.PI / 4)
            ctx.fill()

        } else {

            if (recording === right)
                ctx.fillStyle = '#0000ff30'
            else
                ctx.fillStyle = '#ff000030'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, Math.PI / 4, -Math.PI / 4, true)
            ctx.arc(0, 0, .5, -Math.PI / 4, Math.PI / 4)
            ctx.fill()

        }

        let left = GamepadControl[`${this.joystick}_left_dir`]
        if (defined.includes(left)) {

            let range = map(gamepad[`${this.joystick}_left_dir`], 0, 1, minRange, .5)

            ctx.fillStyle = '#00ff00'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, Math.PI + Math.PI / 4, Math.PI + -Math.PI / 4, true)
            ctx.arc(0, 0, range, Math.PI + -Math.PI / 4, Math.PI + Math.PI / 4)
            ctx.fill()

        } else {

            if (recording === left)
                ctx.fillStyle = '#0000ff30'
            else
                ctx.fillStyle = '#ff000030'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, Math.PI + Math.PI / 4, Math.PI + -Math.PI / 4, true)
            ctx.arc(0, 0, .5, Math.PI + -Math.PI / 4, Math.PI + Math.PI / 4)
            ctx.fill()

        }

        let up = GamepadControl[`${this.joystick}_up_dir`]
        if (defined.includes(up)) {

            let range = map(gamepad[`${this.joystick}_up_dir`], 0, 1, minRange, .5)

            ctx.fillStyle = '#00ff00'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, Math.PI / 2 + Math.PI / 4, Math.PI / 2 + -Math.PI / 4, true)
            ctx.arc(0, 0, range, Math.PI / 2 + -Math.PI / 4, Math.PI / 2 + Math.PI / 4)
            ctx.fill()

        } else {

            if (recording === up)
                ctx.fillStyle = '#0000ff30'
            else
                ctx.fillStyle = '#ff000030'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, Math.PI / 2 + Math.PI / 4, Math.PI / 2 + -Math.PI / 4, true)
            ctx.arc(0, 0, .5, Math.PI / 2 + -Math.PI / 4, Math.PI / 2 + Math.PI / 4)
            ctx.fill()

        }

        let down = GamepadControl[`${this.joystick}_down_dir`]
        if (defined.includes(down)) {

            let range = map(gamepad[`${this.joystick}_down_dir`], 0, 1, minRange, .5)

            ctx.fillStyle = '#00ff00'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, -Math.PI / 2 + Math.PI / 4, -Math.PI / 2 + -Math.PI / 4, true)
            ctx.arc(0, 0, range, -Math.PI / 2 + -Math.PI / 4, -Math.PI / 2 + Math.PI / 4)
            ctx.fill()

        } else {

            if (recording === down)
                ctx.fillStyle = '#0000ff30'
            else
                ctx.fillStyle = '#ff000030'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, -Math.PI / 2 + Math.PI / 4, -Math.PI / 2 + -Math.PI / 4, true)
            ctx.arc(0, 0, .5, -Math.PI / 2 + -Math.PI / 4, -Math.PI / 2 + Math.PI / 4)
            ctx.fill()

        }

        let button = GamepadControl[`${this.joystick}_button`]
        if (defined.includes(button)) {

            let range = map(gamepad[`${this.joystick}_button`], 0, 1, 0, minRange)

            ctx.fillStyle = '#00ff00'

            ctx.beginPath()
            ctx.arc(0, 0, range, 0, Math.PI * 2, true)
            ctx.fill()

        } else {

            if (recording === button)
                ctx.fillStyle = '#0000ff30'
            else
                ctx.fillStyle = '#ff000030'

            ctx.beginPath()
            ctx.arc(0, 0, minRange, 0, Math.PI * 2, true)
            ctx.fill()

        }

        ctx.strokeStyle = 'black'
        ctx.fillStyle = '#30303030'

        ctx.lineWidth = .025
        ctx.beginPath()
        ctx.arc(0, 0, minRange, 0, 2 * Math.PI)
        ctx.stroke()

        ctx.lineWidth = .025
        ctx.beginPath()
        ctx.arc(0, 0, .5, 0, 2 * Math.PI)
        ctx.stroke()


    }

}

export class GamepadDisplay extends GameObject {

    leftJoystick: JoystickDisplay = new JoystickDisplay('left_joystick')
    rightJoystick: JoystickDisplay = new JoystickDisplay('right_joystick')
    buttonLeft: InputButton = new InputButton('left_button', 'LB')
    buttonRight: InputButton = new InputButton('right_button', 'RB')
    triggerLeft: InputButton = new InputButton('left_trigger', 'LT')
    triggerRight: InputButton = new InputButton('right_trigger', 'RT')

    up: InputButton = new InputButton('button_up_arrow', '^')
    down: InputButton = new InputButton('button_down_arrow', 'v')
    left: InputButton = new InputButton('button_left_arrow', '<')
    right: InputButton = new InputButton('button_right_arrow', '>')

    A: InputButton = new InputButton('button_A', 'A')
    B: InputButton = new InputButton('button_B', 'B')
    X: InputButton = new InputButton('button_X', 'X')
    Y: InputButton = new InputButton('button_Y', 'Y')

    back: InputButton = new InputButton('button_back', 'B')
    home: InputButton = new InputButton('button_home', 'H')
    start: InputButton = new InputButton('button_start', 'S')

    calibrationMessage: string
    noController: string

    constructor(calibrationMessage: string, noController: string) {

        super()

        this.calibrationMessage = calibrationMessage
        this.noController = noController

        this.leftJoystick.transform.translation.set(-.3, 0)
        this.rightJoystick.transform.translation.set(.2, -.3)
        this.buttonLeft.transform.translation.set(-.3, .2)
        this.buttonRight.transform.translation.set(.3, .2)
        this.triggerLeft.transform.translation.set(-.3, .3)
        this.triggerRight.transform.translation.set(.3, .3)

        this.up.transform.translation.set(-.2, -.225)
        this.down.transform.translation.set(-.2, -.375)
        this.left.transform.translation.set(-.275, -.3)
        this.right.transform.translation.set(-.125, -.3)

        this.Y.transform.translation.set(.3, .075)
        this.A.transform.translation.set(.3, -.075)
        this.B.transform.translation.set(.375, 0)
        this.X.transform.translation.set(.225, 0)

        this.back.transform.translation.set(-.075, .1)
        this.home.transform.translation.set(0, .175)
        this.start.transform.translation.set(.075, .1)


        this.add(this.leftJoystick, this.rightJoystick)
        this.add(this.buttonLeft, this.buttonRight)
        this.add(this.triggerLeft, this.triggerRight)
        this.add(this.up, this.down, this.left, this.right)
        this.add(this.A, this.B, this.X, this.Y)
        this.add(this.back, this.home, this.start)

    }

    states: number[] = []

    update(dt: number): void {

        let input = this.input!
        let gamepad = input.gamepad

        this.childrenDrawEnabled = gamepad.is_calibrated

        if (gamepad.has_gamepad && !gamepad.is_calibrated && !gamepad.is_calibrating) {

            input.calibrateGamepad((states) => {

                this.states = states

            })

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        if (!this.input!.gamepad.has_gamepad) {

            ctx.save()
            ctx.scale(1 / 20, -1 / 20)
            ctx.fillStyle = 'gray'
            ctx.font = '1px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(this.noController, 0, 0)
            ctx.restore()

        }

        if (this.input!.isGamepadCalibrating) {

            let radius = .2

            if (this.states.length > 0) {

                let s0 = this.states.filter(e => e === 0).length
                let s1 = this.states.filter(e => e === 1).length
                let s2 = this.states.filter(e => e === 2).length

                let section = 1 / this.states.length * 2 * Math.PI

                ctx.fillStyle = 'lime'

                ctx.beginPath()

                ctx.moveTo(0, 0)
                ctx.arc(0, 0, radius, Math.PI / 2, Math.PI / 2 - s2 * section, true)

                ctx.fill()

                ctx.fillStyle = 'blue'

                ctx.beginPath()

                ctx.moveTo(0, 0)
                ctx.arc(0, 0, radius, Math.PI / 2 - s2 * section, Math.PI / 2 - s2 * section - s1 * section, true)

                ctx.fill()

                ctx.fillStyle = 'red'

                ctx.beginPath()

                ctx.moveTo(0, 0)
                ctx.arc(0, 0, radius, Math.PI / 2 - s2 * section - s1 * section, Math.PI / 2 - s2 * section - s1 * section - s0 * section, true)

                ctx.fill()

            } else {

                ctx.fillStyle = 'red'

                ctx.beginPath()

                ctx.moveTo(0, 0)
                ctx.arc(0, 0, radius, 0, Math.PI * 2, false)

                ctx.fill()

            }

            ctx.save()
            ctx.scale(1 / 20, -1 / 20)
            ctx.fillStyle = 'gray'
            ctx.font = '1px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(this.calibrationMessage, 0, 0)
            ctx.restore()

        }

    }

}