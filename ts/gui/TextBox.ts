import { GameObject } from "../basics/GameObject.js"
import { Rectangle } from "../geometry/Rectangle.js"

export class TextBox extends GameObject {

    static lock: boolean = false

    text: string = ''
    active: boolean = false
    rect: Rectangle = new Rectangle(0, 0, 1, 1)

    fontSize: number
    font: string
    width: number
    color: string = 'white'
    onSound: string
    offSound: string
    align: CanvasTextAlign = 'left'
    baseline: CanvasTextBaseline = 'middle'

    placeholder: string = ''

    constructor(fontSize: number, width: number, font: string = 'sans-serif', color = 'black', onSound: string = null, offSound: string = null) {

        super()

        this.fontSize = fontSize
        this.font = font
        this.width = width
        this.color = color
        this.onSound = onSound
        this.offSound = offSound


        this.rect.transform.scale.set(width * 1.1, fontSize * 1.1)

        this.add(this.rect)

        window.addEventListener('keydown', async (event) => {

            if (this.active) {

                if (event.code === 'KeyV' && event.ctrlKey)
                    this.text += await navigator.clipboard.readText()
                else if (event.key.length === 1)
                    this.text += event.key
                else if (event.key === 'Backspace')
                    this.text = this.text.slice(0, -1)
                else if (event.key === 'Enter')
                    this.toggleOff()

            }
        })

        this.drawAfterChildren()

    }

    toggleOn() {

        if (this.active || TextBox.lock) return

        this.rect.displayColor = 'blue'
        this.active = true
        this.input.lock('TextBox')
        TextBox.lock = true

        if (this.onSound) this.engine.soundBank.get(this.onSound)?.play()

    }

    toggleOff() {

        if (!this.active) return

        this.rect.displayColor = 'red'
        this.active = false
        this.input.unlock('TextBox')
        TextBox.lock = false

        if (this.offSound) this.engine.soundBank.get(this.offSound)?.play()

        this.onFinish(this.text)

    }

    toggle() {

        if (!this.active)
            this.toggleOn()

        else
            this.toggleOff()

    }

    onFinish(text: string) { }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            if (this.rect.containsWorldVector(mouse.position)) {
                if (!this.active) this.toggleOn()

            } else
                if (this.active)
                    this.toggleOff()

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        if (this.align === 'left')
            ctx.translate(-this.width / 2, 0)

        if (this.align === 'right')
            ctx.translate(this.width / 2, 0)

        ctx.scale(1, -1)
        ctx.textAlign = this.align
        ctx.textBaseline = this.baseline
        ctx.font = `${this.fontSize}px ${this.font}`
        ctx.fillStyle = this.color

        let txt = this.text + (this.active ? '_' : '')
        if (txt.length === 0) txt = this.placeholder

        ctx.fillText(txt, 0, 0, this.width)

        ctx.restore()

    }

}