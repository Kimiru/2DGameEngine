import { GameObject } from "../basics/GameObject.js"
import { Rectangle } from "../geometry/Rectangle.js"
import { Timer } from "../math/Timer.js"

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