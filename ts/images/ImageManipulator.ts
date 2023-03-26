import { GameObject } from "../basics/GameObject.js"

export class ImageManipulator extends GameObject {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

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

        this.ctx.resetTransform()
        this.ctx.transform(this.width, 0, 0, -this.height, this.width / 2, this.height / 2)

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

    static fromImage(image: HTMLImageElement): ImageManipulator {

        let im = new ImageManipulator(image.width, image.height)

        im.ctx.drawImage(image, 0, 0)

        return im

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.scale(1 / this.width, -1 / this.height)
        ctx.drawImage(this.canvas, -this.width / 2, -this.height / 2)

        ctx.restore()

    }

}