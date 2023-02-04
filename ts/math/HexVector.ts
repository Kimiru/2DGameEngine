import { Vector } from "./Vector.js"

export enum HexOrientation { flat, pointy }

export class HexVector {

    orientation: HexOrientation

    #q: number = 0
    #r: number = 0
    #s: number = 0


    vector: Vector

    unit: number

    constructor(orientation: HexOrientation = HexOrientation.pointy, unit: number = 1, vector: Vector = new Vector(), q = 0, r = 0, s = 0) {

        this.orientation = orientation
        this.unit = unit
        this.vector = vector

        this.setS(q, r, s)

    }

    get q(): number { return this.#q }
    get r(): number { return this.#r }
    get s(): number { return this.#s }

    setS(q: number, r: number, s: number): this {

        let sum = q + r + s

        if (sum !== 0) throw `Check sum for hex positioning should be equal to zero q(${this.#q + q}) + r(${this.#r + r}) + s(${this.#s + s}) === ${sum}`

        this.#q = q
        this.#r = r
        this.#s = s

        this.updateVector()

        return this

    }

    set(hexVector: HexVector): this {

        return this.setS(hexVector.q, hexVector.r, hexVector.s)

    }

    addS(q: number, r: number, s: number): this {

        let sum = this.#q + q + this.#r + r + this.#s + s

        if (sum !== 0) throw `Check sum for hex positioning should be equal to zero q(${this.#q + q}) + r(${this.#r + r}) + s(${this.#s + s}) === ${sum}`

        this.#q += q
        this.#r += r
        this.#s += s

        this.updateVector()

        return this

    }

    add(hexVector: HexVector): this {

        return this.addS(hexVector.q, hexVector.r, hexVector.s)

    }

    updateVector(): void {

        let sqrt3 = Math.sqrt(3)

        if (this.orientation === HexOrientation.pointy) this.vector.set(
            this.unit * (sqrt3 * this.#q + sqrt3 / 2 * this.#r),
            this.unit * (3 / 2 * this.#r)
        )
        else this.vector.set(
            this.unit * (3 / 2 * this.#q),
            this.unit * (sqrt3 / 2 * this.#q + sqrt3 * this.#r)
        )

    }

    updateFromVector(): void {

        let fracQ, fracR

        if (this.orientation === HexOrientation.pointy) {
            fracQ = (Math.sqrt(3) / 3 * this.vector.x - 1 / 3 * this.vector.y) / this.unit
            fracR = (2 / 3 * this.vector.y) / this.unit
        } else {
            fracQ = (2 / 3 * this.vector.x) / this.unit
            fracR = (-1 / 3 * this.vector.x + Math.sqrt(3) / 3 * this.vector.y) / this.unit
        }

        let fracS = -fracQ - fracR

        let q = Math.round(fracQ)
        let r = Math.round(fracR)
        let s = Math.round(fracS)

        let qDiff = Math.abs(q - fracQ)
        let rDiff = Math.abs(r - fracR)
        let sDiff = Math.abs(s - fracS)

        if (qDiff > rDiff && qDiff > sDiff)
            q = -r - s
        else if (rDiff > sDiff)
            r = -q - s
        else s = -q - r

        this.setS(q, r, s)

    }

    distanceTo(hexVector: HexVector): number {

        if (this.orientation !== hexVector.orientation) throw 'HexVector have incompatible orientations'

        return (Math.abs(this.q - hexVector.q) + Math.abs(this.r - hexVector.r) + Math.abs(this.s - hexVector.s)) / 2

    }

    equal(hexVector: HexVector): boolean { return this.#q === hexVector.q && this.#r === hexVector.r && this.#s === hexVector.s }

    equalS(q: number, r: number, s: number): boolean { return this.#q === q && this.#r === r && this.#s === s }

    clone() { return new HexVector(this.orientation, this.unit, undefined, this.#q, this.#r, this.#s) }

    neighbors(): HexVector[] {
        return this.units().map((hexVector: HexVector) => hexVector.add(this))
    }

    units(): HexVector[] { return HexVector.units(this.orientation, this.unit) }

    static units(orientation: HexOrientation, unit: number): HexVector[] {

        return [
            new HexVector(orientation, unit, undefined, 1, -1, 0),
            new HexVector(orientation, unit, undefined, -1, 1, 0),
            new HexVector(orientation, unit, undefined, 0, 1, -1),
            new HexVector(orientation, unit, undefined, 0, -1, 1),
            new HexVector(orientation, unit, undefined, 1, 0, -1),
            new HexVector(orientation, unit, undefined, -1, 0, 1),
        ]

    }

}