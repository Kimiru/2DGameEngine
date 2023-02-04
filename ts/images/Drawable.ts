import { GameObject } from "../basics/GameObject.js"
import { Vector } from "../math/Vector.js"

export class Drawable extends GameObject {

    images: HTMLImageElement[] = []
    size: Vector = new Vector()
    halfSize: Vector = new Vector()

    constructor(...images: HTMLImageElement[]) {

        super()

        if (images.length === 0) throw 'There is no image!'

        this.images = images

        this.size.set(this.images[0].width, this.images[0].height)
        this.halfSize.copy(this.size).divS(2)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.scale(1 / this.size.x, -1 / this.size.y)

        for (let image of this.images)
            ctx.drawImage(image, -this.halfSize.x, -this.halfSize.y)

        ctx.restore()

    }

}