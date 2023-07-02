import { GameObject, Vector, minmax } from "../2DGameEngine.js"
import { CubicBezier } from "./CubicBezier.js"

export class CubicBezierSpline extends GameObject {

    cubicBeziers: CubicBezier[] = []

    constructor(cubicBeziers: CubicBezier[]) {

        super()

        this.cubicBeziers = cubicBeziers

    }

    get(t: number): Vector {

        t = minmax(0, t, this.cubicBeziers.length)
        let floorT = Math.floor(minmax(0, t, this.cubicBeziers.length - 1))

        return this.cubicBeziers[floorT]?.get(t - floorT) ?? null

    }

    getLengthAtT(t: number): number {

        t = minmax(0, t, this.cubicBeziers.length)
        let floorT = Math.floor(minmax(0, t, this.cubicBeziers.length - 1))

        let length = 0

        for (let index = 0; index < floorT; index++)
            length += this.cubicBeziers[index].length()

        return length + this.cubicBeziers[floorT].getLengthAtT(t - floorT)

    }

    getTAtLength(length: number): number {

        length = minmax(0, length, this.length())

        let t = 0

        for (let cb of this.cubicBeziers) {

            let cbLength = cb.length()

            if (cbLength < length) {
                length -= cbLength
                t += 1
            } else {
                t += cb.getTAtLength(length)
                return t
            }

        }

        return t

    }

    length() {

        let length = 0

        for (let cb of this.cubicBeziers)
            length += cb.length()

        return length

    }

    draw(ctx: CanvasRenderingContext2D): void {

        for (let cb of this.cubicBeziers)
            cb.executeDraw(ctx)

    }

}