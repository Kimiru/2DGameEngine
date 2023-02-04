import { Vector } from "../math/Vector.js"
import { Polygon } from "./Polygon.js"

/**
 * 
 */
export class Rectangle extends Polygon {

    display: boolean = false
    displayColor: string = 'red'

    #ptmem: Vector[] = [new Vector(), new Vector()]

    constructor(x: number = 0, y: number = 0, w: number = 1, h: number = 1, display: boolean = false, displayColor: string = 'red') {

        super([], [])

        this.addTag('rectangle')

        this.transform.translation.set(x, y)
        this.transform.scale.set(w, h)

        this.#ptmem[0].copy(this.transform.translation)
        this.#ptmem[1].copy(this.transform.scale)

        this.display = display
        this.displayColor = displayColor

    }

    getLinear(): Vector[] {

        if (this.outer.length === 0 || !this.#ptmem[0].equal(this.transform.translation) || !this.#ptmem[1].equal(this.transform.scale)) {

            this.outer = [this.topleft, this.bottomleft, this.bottomright, this.topright]
            this.#ptmem[0].copy(this.transform.translation)
            this.#ptmem[1].copy(this.transform.translation)

        }

        return super.getLinear()

    }

    get x(): number { return this.transform.translation.x }
    set x(n: number) { this.transform.translation.x = n }
    get y(): number { return this.transform.translation.y }
    set y(n: number) { this.transform.translation.y = n }
    get w(): number { return this.transform.scale.x }
    set w(n: number) { this.transform.scale.x = n }
    get h(): number { return this.transform.scale.y }
    set h(n: number) { this.transform.scale.y = n }

    get halfW(): number { return this.transform.scale.x / 2 }
    set halfW(n: number) { this.transform.scale.x = n * 2 }
    get halfH(): number { return this.transform.scale.y / 2 }
    set halfH(n: number) { this.transform.scale.y = n * 2 }

    get left(): number { return this.transform.translation.x - this.halfW }
    set left(n: number) { this.transform.translation.x = n + this.halfW }
    get right(): number { return this.transform.translation.x + this.halfW }
    set right(n: number) { this.transform.translation.x = n - this.halfW }
    get bottom(): number { return this.transform.translation.y - this.halfH }
    set bottom(n: number) { this.transform.translation.y = n + this.halfH }
    get top(): number { return this.transform.translation.y + this.halfH }
    set top(n: number) { this.transform.translation.y = n - this.halfH }

    get topleft(): Vector { return new Vector(this.left, this.top) }
    set topleft(v: Vector) { this.left = v.x; this.top = v.y }
    get bottomleft(): Vector { return new Vector(this.left, this.bottom) }
    set bottomleft(v: Vector) { this.left = v.x; this.bottom = v.y }
    get topright(): Vector { return new Vector(this.right, this.top) }
    set topright(v: Vector) { this.right = v.x; this.top = v.y }
    get bottomright(): Vector { return new Vector(this.right, this.bottom) }
    set bottomright(v: Vector) { this.right = v.x; this.bottom = v.y }

    contains(vector: Vector): boolean { return vector.x <= this.right && vector.x >= this.left && vector.y <= this.top && vector.y >= this.bottom }

    collide(rect: Rectangle) {

        return this.left < rect.right &&
            rect.left < this.right &&
            this.bottom < rect.top &&
            rect.bottom < this.top

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.display) {

            ctx.save()
            ctx.scale(1 / this.w, 1 / this.h)

            ctx.fillStyle = this.displayColor
            ctx.fillRect(-.5, -.5, 1, 1)

            ctx.restore()

        }

        return true

    }

    clone(): Rectangle {

        return new Rectangle(this.x, this.y, this.w, this.h)

    }

    copy(rectangle: Rectangle): this {

        this.x = rectangle.x
        this.y = rectangle.y
        this.w = rectangle.w
        this.h = rectangle.h

        return this

    }

    toString() {

        return `Rectangle(${this.x}, ${this.y}, ${this.w}, ${this.h})`

    }

}