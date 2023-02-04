import { HexOrientation } from "../math/HexVector.js"
import { Vector } from "../math/Vector.js"
import { Polygon } from "./Polygon.js"

export class Hexagon extends Polygon {

    unit: number
    orientation: HexOrientation

    display: boolean = false
    color: string = 'red'

    constructor(position: Vector = new Vector(), orientation: HexOrientation = HexOrientation.pointy, unit: number = 1) {

        super()

        this.addTag('hexagon')

        this.transform.translation.copy(position)
        this.unit = unit
        this.orientation = orientation

    }

    getLinear(): Vector[] {

        let points: Vector[] = []

        let angleOffset = this.orientation === HexOrientation.pointy ? Math.PI / 6 : 0

        let radius = this.unit

        for (let i = 0; i < 6; i++) {

            let angle = Math.PI / 3 * i + angleOffset

            points.push(new Vector(Math.cos(angle) * radius, Math.sin(angle) * radius))

        }

        return points

    }

    static ctxPath(ctx: CanvasRenderingContext2D, orientation: HexOrientation, unit: number) {

        let angleOffset = orientation === HexOrientation.pointy ? Math.PI / 6 : 0

        ctx.moveTo(Math.cos(angleOffset) * unit, Math.sin(angleOffset) * unit)

        for (let i = 1; i < 7; i++) {

            let angle = Math.PI / 3 * i + angleOffset

            ctx.lineTo(Math.cos(angle) * unit, Math.sin(angle) * unit)

        }

        ctx.closePath()

    }

    ctxPath(ctx): void {

        Hexagon.ctxPath(ctx, this.orientation, this.unit)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        if (!this.display) return

        ctx.lineWidth = .1
        ctx.strokeStyle = this.color

        ctx.beginPath()

        this.ctxPath(ctx)

        ctx.stroke()

    }

}