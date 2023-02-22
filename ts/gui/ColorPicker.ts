import { GameObject, HexColorToRGB, HSLToRGB, map, minmax, RBGToHexColor, Rectangle, RGBToHSL, Segment, TextBox, TransformMatrix, Vector } from '../2DGameEngine.js'

const ctx = (document.createElement('canvas') as HTMLCanvasElement).getContext('2d')

const rainbow = ctx.createLinearGradient(-1, 0, .5, 0)
rainbow.addColorStop(0, 'hsl(0, 100%, 50%')
rainbow.addColorStop(1 / 6, 'hsl(60, 100%, 50%')
rainbow.addColorStop(1 / 3, 'hsl(120, 100%, 50%')
rainbow.addColorStop(1 / 2, 'hsl(180, 100%, 50%')
rainbow.addColorStop(2 / 3, 'hsl(240, 100%, 50%')
rainbow.addColorStop(5 / 6, 'hsl(300, 100%, 50%')
rainbow.addColorStop(1, 'hsl(360, 100%, 50%')

export class ColorPicker extends GameObject {



    htb: TextBox = new TextBox(.15, .4 / 1.1, 'sans-serif', 'black')
    stb: TextBox = new TextBox(.15, .4 / 1.1, 'sans-serif', 'black')
    ltb: TextBox = new TextBox(.15, .4 / 1.1, 'sans-serif', 'black')

    h: number = 0
    s: number = 100
    l: number = 50

    constructor() {

        super()

        this.htb.text = '0'
        this.htb.align = 'center'
        this.htb.baseline = 'middle'
        this.htb.transform.translation.set(.75, 0.375)
        this.htb.onFinish = (str: string) => {

            if (!isNaN(parseInt(str)))
                this.h = minmax(0, parseInt(str), 360)


            this.htb.text = this.h.toString()
            this.onChange(this.h, this.s, this.l)

        }
        this.add(this.htb)

        this.stb.text = '100'
        this.stb.align = 'center'
        this.stb.baseline = 'middle'
        this.stb.transform.translation.set(.75, 0.125)
        this.stb.onFinish = (str: string) => {

            if (!isNaN(parseInt(str)))
                this.s = minmax(0, parseInt(str), 100)

            this.stb.text = this.s.toString()
            this.onChange(this.h, this.s, this.l)

        }
        this.add(this.stb)

        this.ltb.text = '50'
        this.ltb.align = 'center'
        this.ltb.baseline = 'middle'
        this.ltb.transform.translation.set(.75, -0.125)
        this.ltb.onFinish = (str: string) => {

            if (!isNaN(parseInt(str)))
                this.l = minmax(0, parseInt(str), 100)

            this.ltb.text = this.l.toString()
            this.onChange(this.h, this.s, this.l)

        }

        this.add(this.ltb)

    }

    getHSLColor(): string { return `hsl(${this.h},${this.s}%,${this.l}%)` }

    getHSL(): [number, number, number] { return [this.h, this.s, this.l] }

    importHSL(h: number, s: number, l: number) {

        this.h = h
        this.s = s
        this.l = l

        this.htb.text = h.toString()
        this.stb.text = s.toString()
        this.ltb.text = l.toString()

    }

    getRGBColor(): string { return `rgb(${this.getRGB().join(',')})` }

    getRGB(): [number, number, number] { return HSLToRGB(this.h, this.s, this.l) }

    importRGB(r: number, g: number, b: number) { this.importHSL(...RGBToHSL(r, g, b)) }

    getHexColor(): string {

        return RBGToHexColor(...this.getRGB())

    }

    importHexColor(hexColor: string) {

        this.importRGB(...HexColorToRGB(hexColor))

    }

    onChange(h: number, s: number, l: number): void { }

    update(dt: number): void {

        let mouse = this.input.mouse

        if (mouse.left) {

            let wtm = this.getWorldTransformMatrix()

            let rect = new Rectangle()
            rect.parent = this
            rect.w = 1.5
            rect.h = .125
            rect.left = -1
            rect.bottom = 0.3125

            let left = TransformMatrix.multVec(wtm, new Vector(rect.left, rect.y))
            let right = TransformMatrix.multVec(wtm, new Vector(rect.right, rect.y))

            let [t, p] = new Segment(left, right).project(mouse.position)

            if (rect.containsWorldVector(mouse.position)) {

                this.h = Math.round(360 * t)
                this.htb.text = this.h.toString()

                this.onChange(this.h, this.s, this.l)

                return

            }

            rect.bottom = 0.0625

            if (rect.containsWorldVector(mouse.position)) {

                this.s = Math.round(100 * t)
                this.stb.text = this.s.toString()

                this.onChange(this.h, this.s, this.l)

                return

            }

            rect.bottom = -0.1875

            if (rect.containsWorldVector(mouse.position)) {

                this.l = Math.round(100 * t)
                this.ltb.text = this.l.toString()

                this.onChange(this.h, this.s, this.l)

                return

            }

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.strokeStyle = 'black'
        ctx.lineWidth = .01

        ctx.fillStyle = rainbow
        ctx.fillRect(-1, 0.3125, 1.5, .125)

        const saturation = ctx.createLinearGradient(-1, 0, .5, 0)
        saturation.addColorStop(0, `hsl(${this.h}, 0%, ${this.l}%)`)
        saturation.addColorStop(1, `hsl(${this.h}, 100%, ${this.l}%)`)

        ctx.fillStyle = saturation
        ctx.fillRect(-1, 0.0625, 1.5, .125)

        const lightness = ctx.createLinearGradient(-1, 0, .5, 0)
        lightness.addColorStop(0, `hsl(${this.h}, ${this.s}%, 0%)`)
        lightness.addColorStop(.5, `hsl(${this.h}, ${this.s}%, 50%)`)
        lightness.addColorStop(1, `hsl(${this.h}, ${this.s}%, 100%)`)

        ctx.fillStyle = lightness
        ctx.fillRect(-1, -0.1875, 1.5, .125)

        ctx.fillStyle = this.getHSLColor()
        ctx.fillRect(-1, -0.4375, 1.5, .125)

        let h = map(Number(this.h), 0, 360, -1, .5)
        let s = map(Number(this.s), 0, 100, -1, .5)
        let l = map(Number(this.l), 0, 100, -1, .5)

        ctx.beginPath()

        ctx.moveTo(h, .5)
        ctx.lineTo(h, .25)
        ctx.moveTo(s, .25)
        ctx.lineTo(s, 0)
        ctx.moveTo(l, 0)
        ctx.lineTo(l, -.25)

        ctx.stroke()

    }

}