import { Drawable } from "./Drawable.js"

const SpriteSheetOptions: { images: Array<HTMLImageElement>, cellWidth: number, cellHeight: number } = {

    images: [],
    cellWidth: 16,
    cellHeight: 16,

}

export class SpriteSheet extends Drawable {

    options: typeof SpriteSheetOptions

    horizontalCount: number

    cursor: number = 0
    loopOrigin: number = 0
    tileInLoop: number = 1

    savedLoop: Map<string, [number, number]> = new Map()


    constructor(options: typeof SpriteSheetOptions = SpriteSheetOptions) {

        super(...options.images)

        this.options = { ...options }

        this.horizontalCount = this.images[0].width / this.options.cellWidth
        this.imageSize.set(this.options.cellWidth, this.options.cellHeight)
        this.halfSize.copy(this.imageSize).divS(2)

    }

    XYToIndex(x: number, y: number) {

        return x + y * this.horizontalCount

    }

    indexToXY(index): [number, number] {

        let x = index % this.horizontalCount
        let y = Math.floor(index / this.horizontalCount)

        return [x, y]

    }

    saveLoop(name: string, loopOrigin: number, tileInLoop: number) { this.savedLoop.set(name, [loopOrigin, tileInLoop]) }

    useLoop(name: string, index: number = 0) { this.setLoop(...this.savedLoop.get(name) ?? [0, 0], index) }

    isLoop(name: string): boolean {
        let loop = this.savedLoop.get(name)
        if (!loop) return false

        return this.loopOrigin == loop[0]
    }

    setLoop(loopOrigin: number, tileInLoop: number, startIndex: number = 0) {

        this.loopOrigin = loopOrigin
        this.tileInLoop = tileInLoop
        this.cursor = this.loopOrigin + startIndex % tileInLoop

    }

    getLoopIndex(): number { return this.cursor - this.loopOrigin }

    next() { this.cursor = this.loopOrigin + (this.getLoopIndex() + 1) % this.tileInLoop }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        let x = this.cursor % this.horizontalCount
        let y = Math.floor(this.cursor / this.horizontalCount)

        x *= this.imageSize.x
        y *= this.imageSize.y

        ctx.imageSmoothingEnabled = this.imageSmoothing

        ctx.scale(1 / this.imageSize.x, -1 / this.imageSize.y)
        for (let image of this.images)
            ctx.drawImage(image, x, y, this.imageSize.x, this.imageSize.y, -this.halfSize.x, -this.halfSize.y, this.imageSize.x, this.imageSize.y)

        ctx.restore()

    }

}