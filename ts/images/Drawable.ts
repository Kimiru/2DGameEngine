import { GameObject } from "../basics/GameObject.js"
import { Vector } from "../math/Vector.js"
import { ImageManipulator } from "./ImageManipulator.js"

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

    render(resolution: Vector = this.size, margin: number = 0, smoothing: boolean = false): ImageManipulator {

        let imageManipulator = new ImageManipulator(resolution.x + margin * 2, resolution.y + margin * 2)
        imageManipulator.ctx.imageSmoothingQuality = 'high'
        imageManipulator.ctx.imageSmoothingEnabled = smoothing

        for (let image of this.images) {

            imageManipulator.ctx.drawImage(image, 0, 0, image.width, image.height, margin, margin, resolution.x, resolution.y)

        }

        return imageManipulator

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.scale(1 / this.size.x, -1 / this.size.y)

        for (let image of this.images)
            ctx.drawImage(image, -this.halfSize.x, -this.halfSize.y)

        ctx.restore()

    }

}