import { Color, GameObject, map, minmax, Rectangle, Segment, TextBox, TransformMatrix, Vector } from '../2DGameEngine.js'
import { textoptions } from './Utils.js'

const ctx = (document.createElement('canvas') as HTMLCanvasElement).getContext('2d')

const rainbow = ctx.createLinearGradient(-1, 0, .5, 0)
rainbow.addColorStop(0, 'hsl(0, 100%, 50%')
rainbow.addColorStop(1 / 6, 'hsl(60, 100%, 50%')
rainbow.addColorStop(1 / 3, 'hsl(120, 100%, 50%')
rainbow.addColorStop(1 / 2, 'hsl(180, 100%, 50%')
rainbow.addColorStop(2 / 3, 'hsl(240, 100%, 50%')
rainbow.addColorStop(5 / 6, 'hsl(300, 100%, 50%')
rainbow.addColorStop(1, 'hsl(360, 100%, 50%')

let textboxOptions: textoptions = {
    size: .15,
    font: 'sans-serif',
    color: 'black',
    outlineColor: 'white',
    lineWidth: 0.1,
    maxWidth: .4,
    align: 'center',
    baseline: 'middle'
}

export class ColorPicker extends GameObject {

    color: Color = new Color()

    htb: TextBox = new TextBox('0', textboxOptions)
    stb: TextBox = new TextBox('100', textboxOptions)
    ltb: TextBox = new TextBox('50', textboxOptions)

    constructor() {

        super()

        this.color.HSL = [0, 100, 50]

        this.htb.transform.translation.set(.75, 0.375)
        this.htb.onChange = (str: string) => {

            if (!isNaN(parseInt(str)))
                this.color.h = minmax(0, parseInt(str), 360)


            this.htb.text = this.color.h.toString()
            this.onChange(this.color.clone())

        }
        this.add(this.htb)

        this.stb.transform.translation.set(.75, 0.125)
        this.stb.onChange = (str: string) => {

            if (!isNaN(parseInt(str)))
                this.color.s = minmax(0, parseInt(str), 100)

            this.stb.text = this.color.s.toString()
            this.onChange(this.color.clone())

        }
        this.add(this.stb)

        this.ltb.transform.translation.set(.75, -0.125)
        this.ltb.onChange = (str: string) => {

            if (!isNaN(parseInt(str)))
                this.color.l = minmax(0, parseInt(str), 100)

            this.ltb.text = this.color.l.toString()
            this.onChange(this.color.clone())

        }

        this.add(this.ltb)

    }

    onChange(color: Color): void { }

    update(dt: number): void {

        let mouse = this.input.mouse

        let rect = new Rectangle(0, 0, 2.5, 1)
        rect.parent = this

        if ((mouse.left || mouse.leftClick) && rect.containsWorldVector(mouse.position)) {

            let wtm = this.getWorldTransformMatrix()

            rect.w = 1.5
            rect.h = .125
            rect.left = -1
            rect.bottom = 0.3125

            let left = TransformMatrix.multVec(wtm, new Vector(rect.left, rect.y))
            let right = TransformMatrix.multVec(wtm, new Vector(rect.right, rect.y))

            let [t, p] = new Segment(left, right).project(mouse.position)

            if (rect.containsWorldVector(mouse.position) && !mouse.leftClick) {

                this.color.h = Math.round(360 * t)
                this.htb.text = this.color.h.toString()

                return

            }

            rect.bottom = 0.0625

            if (rect.containsWorldVector(mouse.position) && !mouse.leftClick) {

                this.color.s = Math.round(100 * t)
                this.stb.text = this.color.s.toString()

                return

            }

            rect.bottom = -0.1875

            if (rect.containsWorldVector(mouse.position) && !mouse.leftClick) {

                this.color.l = Math.round(100 * t)
                this.ltb.text = this.color.l.toString()

                return

            }

            if (mouse.leftClick)
                this.onChange(this.color.clone())

        }

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.strokeStyle = 'black'
        ctx.lineWidth = .01

        ctx.fillStyle = rainbow
        ctx.fillRect(-1, 0.3125, 1.5, .125)

        const saturation = ctx.createLinearGradient(-1, 0, .5, 0)
        saturation.addColorStop(0, `hsl(${this.color.h}, 0%, ${this.color.l}%)`)
        saturation.addColorStop(1, `hsl(${this.color.h}, 100%, ${this.color.l}%)`)

        ctx.fillStyle = saturation
        ctx.fillRect(-1, 0.0625, 1.5, .125)

        const lightness = ctx.createLinearGradient(-1, 0, .5, 0)
        lightness.addColorStop(0, `hsl(${this.color.h}, ${this.color.s}%, 0%)`)
        lightness.addColorStop(.5, `hsl(${this.color.h}, ${this.color.s}%, 50%)`)
        lightness.addColorStop(1, `hsl(${this.color.h}, ${this.color.s}%, 100%)`)

        ctx.fillStyle = lightness
        ctx.fillRect(-1, -0.1875, 1.5, .125)

        ctx.fillStyle = this.color.toString()
        ctx.fillRect(-1, -0.4375, 1.5, .125)

        let h = map(Number(this.color.h), 0, 360, -1, .5)
        let s = map(Number(this.color.s), 0, 100, -1, .5)
        let l = map(Number(this.color.l), 0, 100, -1, .5)

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