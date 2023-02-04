import { GameObject } from "../basics/GameObject.js"
import { Rectangle } from "../geometry/Rectangle.js"

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