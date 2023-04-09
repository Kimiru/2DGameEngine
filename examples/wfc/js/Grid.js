import { GameObject, Vector } from "../../../js/2DGameEngine.js"

export class Grid extends GameObject {

    size

    constructor(width, height) {
        super()
        this.size = new Vector(width, height)

        this.zIndex = 100
    }

    draw(ctx) {

        ctx.strokeStyle = 'white'
        ctx.lineWidth = .01
        ctx.beginPath()

        let w = Math.ceil(this.size.x / 2) - (this.size.x & 1 ? .5 : 0)
        let h = Math.ceil(this.size.y / 2) - (this.size.y & 1 ? .5 : 0)

        for (let x = -w; x <= w; x++) {
            ctx.moveTo(x, -h)
            ctx.lineTo(x, h)
        }

        for (let y = -h; y <= h; y++) {
            ctx.moveTo(-w, y)
            ctx.lineTo(w, y)
        }
        ctx.stroke()

    }

}