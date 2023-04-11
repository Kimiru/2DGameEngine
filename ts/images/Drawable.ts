import { GameObject } from "../basics/GameObject.js"
import { Vector } from "../math/Vector.js"
import { ImageManipulator } from "./ImageManipulator.js"

export class Drawable extends GameObject {

    images: HTMLImageElement[] = []
    imageSize: Vector = new Vector()
    halfSize: Vector = new Vector()
    imageSmoothing: boolean = true

    constructor(...images: HTMLImageElement[]) {

        super()

        if (images.length === 0) throw 'There is no image!'

        this.images = images

        this.imageSize.set(this.images[0].width, this.images[0].height)
        this.halfSize.copy(this.imageSize).divS(2)

    }

    render(resolution: Vector = this.imageSize, margin: number = 0, smoothing: boolean = false): ImageManipulator {

        let imageManipulator = new ImageManipulator(resolution.x + margin * 2, resolution.y + margin * 2)
        imageManipulator.ctx.imageSmoothingQuality = 'high'
        imageManipulator.ctx.imageSmoothingEnabled = smoothing

        imageManipulator.setCtxToCenter()
        imageManipulator.ctx.scale(...resolution.clone().div(resolution.clone().addS(margin, margin)).arrayXY())

        this.executeDraw(imageManipulator.ctx)

        return imageManipulator

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.imageSmoothingEnabled = this.imageSmoothing

        ctx.scale(1 / this.imageSize.x, -1 / this.imageSize.y)

        for (let image of this.images)
            ctx.drawImage(image, -this.halfSize.x, -this.halfSize.y)

        ctx.restore()

    }

}