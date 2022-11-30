import { GameObject, GamepadControl, Timer } from "./2DGameEngine.js"
import { Rectangle } from "./2DGEGeometry.js"
import { map, TransformMatrix, Vector } from "./2DGEMath.js"

/**
 * The FPSCounter class is, as its name says, used to display the number of FPS of the game on the top left corner of the screen in a given font size
 */
export class FPSCounter extends GameObject {

    timer = new Timer()
    frameCount = 0
    fps = 0
    fontSize: number = 12

    /**
     * Create a new FPSCounter with a given font size
     * 
     * @param fontsize 
     */
    constructor(fontsize: number = 10) {

        super()

        this.fontSize = fontsize

    }

    /**
     * Update the timer
     * Should not be called by the user
     * 
     * @param {number} dt 
     * @returns {boolean}
     */
    update(dt: number) {

        this.frameCount++

        if (this.timer.greaterThan(1000)) {

            this.fps = this.frameCount
            this.frameCount = 0
            this.timer.reset()

        }

        return true

    }

    /**
     * Draw the timer on the top left corner
     * Should not be called by the user
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @return {boolean}
     */
    draw(ctx: CanvasRenderingContext2D): boolean {


        ctx.save()

        let engine = this.engine

        ctx.translate(-engine.usableWidth / 2, engine.usableHeight / 2)

        ctx.scale(1, -1)

        ctx.font = `${this.fontSize}px sans-serif`
        ctx.fillStyle = 'red'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(this.fps.toString(), this.fontSize / 2, this.fontSize / 2)

        ctx.restore()

        return true

    }

}

export class MouseCursor extends GameObject {

    constructor() {

        super()

    }

    update(dt: number): void {

        let mouse = this.scene.engine.input.mouse

        this.transform.translation.copy(mouse.position)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.fillStyle = 'red'

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -5)
        ctx.lineTo(4, -4)
        ctx.lineTo(0, 0)
        ctx.fill()

    }

}

export class TextBox extends GameObject {

    text: string = ''
    active: boolean = false
    rect: Rectangle = new Rectangle(0, 0, 1, 1)

    fontSize: number
    font: string
    width: number
    color: string = 'white'
    onSound: string
    offSound: string

    placeholder: string = ''

    constructor(fontSize: number, width: number, font: string = 'sans-serif', color = 'black', onSound: string = null, offSound: string = null) {

        super()

        this.fontSize = fontSize
        this.font = font
        this.width = width
        this.color = color
        this.onSound = onSound
        this.offSound = offSound


        this.rect.transform.scale.set(width + 4, fontSize + 4)

        this.add(this.rect)

        window.addEventListener('keydown', async (event) => {

            if (this.active) {

                if (event.code === 'KeyV' && event.ctrlKey)
                    this.text += await navigator.clipboard.readText()
                else if (event.key.length === 1)
                    this.text += event.key
                else if (event.key === 'Backspace')
                    this.text = this.text.slice(0, -1)
                else if (event.key === 'Enter') {
                    this.rect.displayColor = 'red'
                    this.active = false

                    if (this.offSound) this.engine.soundBank.get(this.offSound)?.play()

                }
            }

        })

        this.drawAfterChildren()

    }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            if (this.rect.containsWorldVector(mouse.position)) {

                if (!this.active) {

                    this.rect.displayColor = 'blue'
                    this.active = true

                    if (this.onSound) this.engine.soundBank.get(this.onSound)?.play()
                }

            }

            else {

                if (this.active) {

                    this.rect.displayColor = 'red'
                    this.active = false

                    if (this.offSound) this.engine.soundBank.get(this.offSound)?.play()

                }

            }

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.translate(-this.width / 2, 0)
        ctx.scale(1, -1)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.font = `${this.fontSize}px ${this.font}`
        ctx.fillStyle = this.color

        let txt = this.text + (this.active ? '_' : '')
        if (txt.length === 0) txt = this.placeholder

        ctx.fillText(txt, 0, 0, this.width)

        ctx.restore()

    }

}

export class Button extends GameObject {


    text: string = ''
    #active: Timer = new Timer(0)
    rect: Rectangle = new Rectangle(0, 0, 1, 1)

    get active(): boolean { return this.#active.lessThan(150) }

    fontSize: number
    font: string
    width: number
    color: string = 'white'
    activeColor: string = 'gray'
    onSound: string

    constructor(fontSize: number, width: number, font: string = 'sans-serif', color = 'black', onSound: string = null, margin = 4) {

        super()

        this.fontSize = fontSize
        this.font = font
        this.width = width
        this.color = color
        this.onSound = onSound

        this.rect.transform.scale.set(width + margin, fontSize + margin)

        this.add(this.rect)

        this.drawAfterChildren()

    }

    get currentColor(): string { return this.active ? this.activeColor : this.color }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            if (this.rect.containsWorldVector(mouse.position) && !this.active) {

                this.#active.reset()
                this.onActive()

                if (this.onSound) this.engine.soundBank.get(this.onSound)?.play()

            }

        }

        if (this.active) this.rect.displayColor = 'blue'
        else this.rect.displayColor = 'red'

    }

    onActive() { }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.scale(1, -1)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `${this.fontSize}px ${this.font}`
        ctx.fillStyle = this.currentColor

        ctx.fillText(this.text, 0, 0, this.width)

        ctx.restore()

    }

}

export class Label extends GameObject {

    text: string = ''
    align: CanvasTextAlign = 'left'
    fontSize: number = 12
    font: string = 'sans-serif'
    color: string = 'white'
    baseline: CanvasTextBaseline = 'middle'
    maxWidth: number = 300

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
    constructor(text: string, align: CanvasTextAlign, fontSize: number, font: string, color: string, baseline: CanvasTextBaseline, maxWidth: number,) {

        super()

        this.text = text
        this.align = align
        this.fontSize = fontSize
        this.font = font
        this.color = color
        this.baseline = baseline
        this.maxWidth = maxWidth

        this.drawAfterChildren()

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.textAlign = this.align
        ctx.font = `${this.fontSize}px ${this.font}`
        ctx.textBaseline = this.baseline
        ctx.fillStyle = this.color

        ctx.scale(1, -1)
        ctx.fillText(this.text, 0, 0, this.maxWidth)

        ctx.restore()

    }

}

export class CheckBox extends GameObject {

    checked: boolean = false
    rect: Rectangle = new Rectangle(0, 0, 1, 1)
    rectColor: string
    checkColor: string
    size: number
    sound: string

    constructor(checked: boolean = false, size: number = 10, rectColor: string = 'white', checkColor: string = 'red', sound: string = null) {

        super()

        this.checked = checked
        this.rectColor = rectColor
        this.checkColor = checkColor
        this.size = size
        this.sound = sound

        this.rect.transform.scale.set(size, size)
        this.add(this.rect)

    }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (this.rect.containsWorldVector(mouse.position) && mouse.leftClick) {

            this.checked = !this.checked
            this.onChange()

            if (this.sound) this.engine.soundBank.get(this.sound)?.play()

        }

    }

    onChange() { }

    draw(ctx: CanvasRenderingContext2D): void {

        let hs = this.size / 2

        if (this.checked) {

            ctx.strokeStyle = this.checkColor
            ctx.beginPath()
            ctx.moveTo(-hs, -hs)
            ctx.lineTo(hs, hs)
            ctx.moveTo(-hs, hs)
            ctx.lineTo(hs, -hs)
            ctx.stroke()

        }

        ctx.strokeStyle = this.rectColor

        ctx.strokeRect(-hs, -hs, this.size, this.size)

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

        let input = this.input
        let gamepad = input.gamepad

        this.childrenDrawEnabled = gamepad.is_calibrated

        if (gamepad.has_gamepad && !gamepad.is_calibrated && !gamepad.is_calibrating) {

            input.calibrateGamepad((states) => {

                this.states = states

            })

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        if (!this.input.gamepad.has_gamepad) {

            ctx.save()
            ctx.scale(1 / 20, -1 / 20)
            ctx.fillStyle = 'gray'
            ctx.font = '1px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(this.noController, 0, 0)
            ctx.restore()

        }

        if (this.input.isGamepadCalibrating) {

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

const minRange = .2

class JoystickDisplay extends GameObject {

    joystick = 'left_joystick'

    constructor(joystick: string) {

        super()

        this.joystick = joystick

        this.transform.scale.set(.2, .2)

    }

    update(dt: number) {

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            if (this.input.getRecording()) return

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

                    if (this.input.getGamepadControlAccess(control))
                        this.input.unsetGamepadControl(control)
                    else
                        this.input.recordGamepadControl(control)

                } else {

                    if (this.input.getGamepadControlAccess(GamepadControl[`${this.joystick}_button`]))
                        this.input.unsetGamepadControl(GamepadControl[`${this.joystick}_button`])
                    else
                        this.input.recordGamepadControl(GamepadControl[`${this.joystick}_button`])

                }

            }

        }


    }

    draw(ctx: CanvasRenderingContext2D) {

        let gamepad = this.input.gamepad
        let defined = this.input.getDefinedGamepadControls()
        let recording = this.input.getRecording()

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

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            if (this.input.getRecording()) return

            let wtm = this.getWorldTransformMatrix()

            let myPosition = TransformMatrix.multVec(wtm, new Vector())
            let range = TransformMatrix.multVec(wtm, new Vector(.5, 0)).distanceTo(myPosition)

            let delta = mouse.position.clone().sub(myPosition)
            let mouseToCenter = delta.length()

            if (mouseToCenter < range) {

                if (this.input.getGamepadControlAccess(GamepadControl[this.button]))
                    this.input.unsetGamepadControl(GamepadControl[this.button])
                else
                    this.input.recordGamepadControl(GamepadControl[this.button])

            }

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        let gamepad = this.input.gamepad
        let defined = this.input.getDefinedGamepadControls()
        let recording = this.input.getRecording()

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