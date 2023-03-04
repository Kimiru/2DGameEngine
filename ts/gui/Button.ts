import { resolveStringable, stringable } from "../2DGameEngine.js"
import { GameObject } from "../basics/GameObject.js"
import { Rectangle } from "../geometry/Rectangle.js"
import { Timer } from "../math/Timer.js"

export class Button extends GameObject {


    text: stringable = ''
    #active: Timer = new Timer(0)
    rect: Rectangle = new Rectangle(0, 0, 1, 1)

    get active(): boolean { return this.#active.lessThan(150) }

    fontSize: number
    font: string
    width: number
    color: string = 'white'
    activeColor: string = 'gray'
    onSound: string

    constructor(text: stringable, fontSize: number, width: number, font: string = 'sans-serif', color = 'black', onSound: string = null, margin = 0) {

        super()

        this.text = text
        this.fontSize = fontSize
        this.font = font
        this.width = width
        this.color = color
        this.onSound = onSound

        this.rect.transform.scale.set(width * 1.1 + margin, fontSize * 1.1 + margin)

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

        ctx.scale(this.fontSize, -this.fontSize)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = `1px ${this.font}`
        ctx.fillStyle = this.currentColor

        ctx.fillText(resolveStringable(this.text), 0, 0, this.width / this.fontSize)

        ctx.restore()

    }

}