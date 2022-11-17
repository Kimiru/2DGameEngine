import { GameObject, Timer } from "./2DGameEngine.js"
import { Rectangle } from "./2DGEGeometry.js"

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