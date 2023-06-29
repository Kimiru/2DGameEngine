import { GameObject } from "../basics/GameObject.js"
import { Vector } from "../math/Vector.js"

const PI_DIV_2 = Math.PI / 2

export class Segment extends GameObject {

    a: Vector = new Vector()
    b: Vector = new Vector()
    display: boolean = false
    lineWidth: number = 1

    constructor(a: Vector, b: Vector, display: boolean = false) {

        super()

        this.a = a
        this.b = b
        this.display = display

    }

    intersect(segment: Segment): Vector {

        let seg1a = segment.getWorldPosition(segment.a.clone())
        let seg1b = segment.getWorldPosition(segment.b.clone())
        let seg2a = this.getWorldPosition(this.a.clone())
        let seg2b = this.getWorldPosition(this.b.clone())

        let x1 = seg1a.x
        let y1 = seg1a.y
        let x2 = seg1b.x
        let y2 = seg1b.y

        let x3 = seg2a.x
        let y3 = seg2a.y
        let x4 = seg2b.x
        let y4 = seg2b.y

        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        if (denum === 0) return null

        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum

        if (t < 0 || t > 1 || u < 0 || u > 1) return null

        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1))

    }

    directionVector() {

        return this.b.clone().sub(this.a).normalize()

    }

    project(point: Vector): Vector {

        return point.projectOn(this.directionVector())

    }

    length(): number {

        return this.a.distanceTo(this.b)

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.display) {

            ctx.strokeStyle = 'red'
            ctx.beginPath()
            ctx.lineWidth = this.lineWidth
            ctx.moveTo(this.a.x, this.a.y)
            ctx.lineTo(this.b.x, this.b.y)
            ctx.stroke()
        }

        return true

    }


}