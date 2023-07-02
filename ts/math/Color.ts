import { lerp, lerpArray } from "./Utils.js"

export type colortuple = [number, number, number]

export enum ColorFormat {

    HSL,
    RGB,
    Hex

}

export class Color {

    h: number
    s: number
    l: number

    constructor() {

        this.h = 0
        this.s = 0
        this.l = 0

    }

    get HSL(): colortuple { return [this.h, this.s, this.l] }
    set HSL([h, s, l]: colortuple) {
        this.h = h
        this.s = s
        this.l = l
    }

    get RGB(): colortuple { return Color.HSLtoRGB(this.HSL) }
    set RGB(rgb: colortuple) { this.HSL = Color.RGBtoHSL(rgb) }

    get Hex(): string { return Color.RBGtoHEX(this.RGB) }
    set Hex(hex: string) { this.RGB = Color.HEXtoRGB(hex) }

    get XYZ(): colortuple {

        let [r, g, b] = this.RGB

        let x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b
        let y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
        let z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b

        return [x, y, z]

    }
    set XYZ([x, y, z]: colortuple) {

        let r = 3.2404542 * x + -1.5371385 * y + -0.4985314 * z
        let g = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z
        let b = 0.0556434 * x + -0.2040259 * y + 1.0572252 * z

    }

    get HCL(): colortuple {

        let [x, y, z] = this.XYZ

        let h = Math.atan2(y, x) * 180 / Math.PI
        if (h < 0) h += 360

        let c = Math.sqrt(x ** 2 + y ** 2)
        let l = z

        return [h, c, l]

    }
    set HCL([h, c, l]: colortuple) {

        let rad = h * Math.PI / 180
        let chroma = c / 100

        let x = chroma * Math.cos(rad)
        let y = l / 100
        let z = chroma * Math.sin(rad)

        this.XYZ = [x, y, z]

    }


    clone(): Color { return Color.HSL(this.HSL) }

    toString(type: ColorFormat = ColorFormat.HSL) {

        switch (type) {
            case ColorFormat.HSL:
                return `hsl(${this.h},${this.s}%,${this.l}%)`
            case ColorFormat.RGB:
                return `rgb(${this.RGB.join(',')})`
            case ColorFormat.Hex:
                return this.Hex
            default:
                return `hsl(${this.h},${this.s}%,${this.l}%)`
        }

    }

    // Creation

    static HSL([h, s, l]: colortuple): Color {

        let color = new Color()

        color.h = h
        color.s = s
        color.l = l

        return color

    }

    static RGB(rgb: colortuple): Color {

        return this.HSL(this.RGBtoHSL(rgb))

    }

    static Hex(hex: string): Color {

        return this.RGB(this.HEXtoRGB(hex))

    }

    // conversion

    static HSLtoRGB([h, s, l]: colortuple): colortuple {

        s /= 100
        l /= 100

        let k = n => (n + h / 30) % 12
        let a = s * Math.min(l, 1 - l)
        let f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

        return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]

    }

    static RGBtoHSL([r, g, b]: colortuple): colortuple {

        r /= 255
        g /= 255
        b /= 255

        const l = Math.max(r, g, b)
        const s = l - Math.min(r, g, b)
        const h = s
            ? l === r
                ? (g - b) / s
                : l === g
                    ? 2 + (b - r) / s
                    : 4 + (r - g) / s
            : 0

        return [
            Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h),
            Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)),
            Math.round((100 * (2 * l - s)) / 2),
        ]

    }

    static HEXtoRGB(hexColor: string): colortuple {

        let match: RegExpExecArray | null

        if ((match = /^#?([0-9a-fA-F]{3})$/.exec(hexColor))) {

            return match[1]
                .split('')
                .map(v => v + v)
                .map(v => parseInt(v, 16)) as [number, number, number]

        }

        if ((match = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hexColor))) {

            return match.slice(1, 4).map(v => parseInt(v, 16)) as [number, number, number]

        }

        return [0, 0, 0]

    }

    static RBGtoHEX([r, g, b]: colortuple): string {

        let rStr = r.toString(16)
        if (rStr.length === 1) rStr = '0' + rStr

        let gStr = g.toString(16)
        if (gStr.length === 1) gStr = '0' + gStr

        let bStr = b.toString(16)
        if (bStr.length === 1) bStr = '0' + bStr

        return `#${rStr}${gStr}${bStr}`

    }

    // Lerp

    static lerpRGB(a: colortuple, b: colortuple, t: number): colortuple {

        return lerpArray(a, b, t) as colortuple

    }

    static lerpHSL(a: colortuple, b: colortuple, t: number): colortuple {

        let h0 = a[0]
        let h1 = b[0]

        let d = Math.abs(h1 - h0)

        let h: number

        if (h0 < h1) {
            if (d > 180)
                h = lerp(h0 + 360, h1, t) % 360
            else
                h = lerp(h0, h1, t)

        } else {
            if (d > 180)
                h = lerp(h0, h1 + 360, t) % 360
            else
                h = lerp(h0, h1, t)
        }

        return [h, lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

    }

}

export type colorable = string | (() => string) | Color

export function resolveColorable(value: colorable) {
    if (value === null || value === undefined) return '#000'
    if (value instanceof Color) return value.toString()
    return typeof value === 'string' ? value : value()
}