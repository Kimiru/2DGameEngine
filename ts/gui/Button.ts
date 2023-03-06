import { resolveStringable, stringable } from "../2DGameEngine.js"
import { GameObject } from "../basics/GameObject.js"
import { Rectangle } from "../geometry/Rectangle.js"
import { Timer } from "../math/Timer.js"
import { drawText, textoptions } from "./Utils.js"

export class Button extends GameObject {


    text: stringable = ''
    #active: Timer = new Timer(0)
    rect: Rectangle = new Rectangle(0, 0, 1, 1)

    get active(): boolean { return this.#active.lessThan(150) }

    options: textoptions = {}

    color: stringable = 'white'
    activeColor: stringable = 'gray'
    onSound: string

    constructor(text: stringable, options: textoptions = {}, onSound: string = null, margin = 0) {

        super()

        this.text = text
        this.options = options
        this.onSound = onSound

        this.rect.transform.scale.set(options.maxWidth * 1.1 + margin, options.maxWidth * 1.1 + margin)

        this.add(this.rect)

        this.drawAfterChildren()

    }

    get currentColor(): string { return resolveStringable(this.active ? this.activeColor : this.color) }

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

        drawText(ctx, this.text, this.options)

    }

}