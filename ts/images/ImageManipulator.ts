import { Rectangle, Vector, loadDataUrl } from "../2DGameEngine.js"
import { GameObject } from "../basics/GameObject.js"

export class ImageManipulator extends GameObject {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    smooth: boolean = true

    constructor(width: number = 1, height: number = 1) {

        super()

        this.canvas = document.createElement('canvas')

        this.canvas.width = width
        this.canvas.height = height

        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false

    }

    get width(): number { return this.canvas.width }

    get height(): number { return this.canvas.height }

    setCtxToCenter() {

        this.ctx.setTransform(this.width, 0, 0, -this.height, this.width / 2, this.height / 2)

    }

    setSize(width: number, height: number) {

        let tmpcanvas = document.createElement('canvas')
        tmpcanvas.width = this.canvas.width
        tmpcanvas.height = this.canvas.height
        let tmpctx = tmpcanvas.getContext('2d')
        tmpctx.imageSmoothingEnabled = false
        tmpctx.drawImage(this.canvas, 0, 0)

        this.canvas.width = width
        this.canvas.height = height

        this.ctx.imageSmoothingEnabled = false

        this.ctx.drawImage(tmpcanvas, 0, 0)

    }

    setPixel(x: number, y: number, color: string) {

        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, 1, 1)

    }

    setPixelRGBA(x: number, y: number, r: number, g: number, b: number, a: number) {

        let imageData = new ImageData(1, 1)

        imageData.data.set([r, g, b, a])

        this.ctx.putImageData(imageData, x, y)

    }

    getPixel(x: number, y: number): [number, number, number, number] {

        let data: ImageData = this.ctx.getImageData(x, y, 1, 1)

        return [data.data[0], data.data[1], data.data[2], data.data[3]]

    }

    print(): string { return this.canvas.toDataURL('image/png') }

    download(name: string, addSize: boolean = false): void {

        let a = document.createElement('a')
        a.href = this.print()
        a.download = `${name}${addSize ? `_${this.width}x${this.height}` : ''}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()

    }

    getImage(): Promise<HTMLImageElement> {

        return new Promise((ok, ko) => {

            let image = document.createElement('img')

            image.onload = () => ok(image)
            image.onerror = () => ko(null)

            image.src = this.print()

        })

    }

    toString(): string { return this.print() }

    clone(): ImageManipulator {

        let im = new ImageManipulator(this.width, this.height)

        im.ctx.drawImage(this.canvas, 0, 0)

        return im

    }

    flipV(): this {

        let im = this.clone()

        this.ctx.save()
        this.ctx.scale(1, -1)
        this.ctx.drawImage(im.canvas, 0, -im.height)
        this.ctx.restore()

        return this

    }

    flipH(): this {

        let im = this.clone()

        this.ctx.save()
        this.ctx.scale(-1, 1)
        this.ctx.drawImage(im.canvas, -im.width, 0)
        this.ctx.restore()

        return this

    }

    rotate270() {

        let clone = this.clone()

        this.setSize(clone.height, clone.width)

        this.ctx.save()
        this.setCtxToCenter()
        this.ctx.rotate(Math.PI / 2)
        this.ctx.drawImage(clone.canvas, -clone.width / 2, -clone.height / 2)
        this.ctx.restore()
    }

    rotate90() {

        let clone = this.clone()

        this.setSize(clone.height, clone.width)

        this.ctx.save()
        this.ctx.translate(this.width / 2, this.height / 2)
        this.ctx.rotate(Math.PI / 2)
        this.ctx.drawImage(clone.canvas, -clone.width / 2, -clone.height / 2)
        this.ctx.restore()

    }

    static fromImage(image: HTMLImageElement): ImageManipulator {

        let im = new ImageManipulator(image.width, image.height)

        im.ctx.drawImage(image, 0, 0)

        return im

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.imageSmoothingEnabled = this.smooth

        ctx.scale(1 / this.width, -1 / this.height)
        ctx.drawImage(this.canvas, -this.width / 2, -this.height / 2)

        ctx.restore()

    }

}


export const CANVAS_RESOLUTION = 2048

export type RawLargeImageManipulator = {
    width: number,
    height: number,
    data: {
        x: number,
        y: number,
        image: string,
    }[]
}

export class LargeImageManipulator extends GameObject {

    canvases: { canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, position: Vector }[]

    fullSize: Vector = new Vector()
    gridSize: Vector = new Vector()
    smooth: boolean = true

    constructor(width: number, height: number) {

        super()

        this.updateSize(width, height)

    }

    updateSize(width: number, height: number) {

        let horizontalCount = Math.ceil(width / CANVAS_RESOLUTION)
        let verticalCount = Math.ceil(height / CANVAS_RESOLUTION)

        this.fullSize.set(width, height)

        if (this.gridSize.equalS(horizontalCount, verticalCount)) return

        this.gridSize.set(horizontalCount, verticalCount)

        let oldCanvases = this.canvases
        this.canvases = []

        let techicalWidth = (horizontalCount - 1) / 2
        let techicalHeight = (verticalCount - 1) / 2

        for (let x = -techicalWidth; x <= techicalWidth; x++)
            for (let y = -techicalHeight; y <= techicalHeight; y++) {

                let canvas = document.createElement('canvas') as HTMLCanvasElement
                canvas.width = canvas.height = CANVAS_RESOLUTION
                let ctx = canvas.getContext('2d')

                this.canvases.push({
                    canvas,
                    ctx,
                    position: new Vector(x, y)
                })

            }


        if (oldCanvases)
            this.run((ctx) => {

                for (let { canvas, position } of oldCanvases) {

                    position.subS(.5, .5).multS(CANVAS_RESOLUTION)

                    ctx.drawImage(canvas, position.x, position.y)

                }
            })

    }

    /**
     * Call the callback on each stored canvas, with the area associated.
     * Edge canvas are automatically clipped out.
     * area Rectangle is freely modifyable 
     */
    run(callback: (ctx: CanvasRenderingContext2D, area: Rectangle) => void, invertVertical: boolean = false): void {

        let vinv = invertVertical ? -1 : 1

        let hw = -this.fullSize.x / 2
        let hh = -this.fullSize.y / 2

        for (let { ctx, position } of this.canvases) {

            let effectivePosition = position.clone().multS(CANVAS_RESOLUTION)

            ctx.save()

            ctx.setTransform(
                1, 0,
                0, -1,
                -effectivePosition.x + CANVAS_RESOLUTION / 2,
                effectivePosition.y + CANVAS_RESOLUTION / 2
            )

            ctx.beginPath()
            ctx.rect(hw, hh, this.fullSize.x, this.fullSize.y)
            ctx.clip()

            callback(ctx, new Rectangle(effectivePosition.x, effectivePosition.y, CANVAS_RESOLUTION, CANVAS_RESOLUTION))

            ctx.restore()

        }

    }

    async export(): Promise<RawLargeImageManipulator> {

        let result: RawLargeImageManipulator = {
            width: this.fullSize.x,
            height: this.fullSize.y,
            data: []
        }

        for (let { canvas, ctx, position } of this.canvases) {

            result.data.push({
                image: canvas.toDataURL(),
                x: position.x * CANVAS_RESOLUTION,
                y: position.y * CANVAS_RESOLUTION
            })

        }

        return result

    }

    import(raw: RawLargeImageManipulator) {

        if (!raw) return

        let { width, height, data } = raw

        for (let { x, y, image } of data) {

            loadDataUrl(image)
                .then(image => this.run((ctx) => {

                    ctx.scale(1, -1)
                    ctx.drawImage(image, x - CANVAS_RESOLUTION / 2, -y - CANVAS_RESOLUTION / 2)

                }))

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()
        ctx.imageSmoothingEnabled = this.smooth

        ctx.scale(1 / this.fullSize.x, -1 / this.fullSize.y)

        for (let { canvas, position } of this.canvases) {

            let positionOnCanvas = position.clone().multS(CANVAS_RESOLUTION).subS(CANVAS_RESOLUTION / 2, -CANVAS_RESOLUTION / 2)

            ctx.drawImage(canvas, positionOnCanvas.x, -positionOnCanvas.y)
        }

        ctx.restore()

    }

}