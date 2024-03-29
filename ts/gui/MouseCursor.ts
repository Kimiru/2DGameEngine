import { GameObject } from "../basics/GameObject.js"

export class MouseCursor extends GameObject {

    constructor() {

        super()

    }

    update(dt: number): void {

        let mouse = this.engine!.input.mouse

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