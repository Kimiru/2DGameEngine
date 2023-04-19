import { GameObject, Vector } from "../2DGameEngine.js"
import { HermiteSpline, HermiteSplineNode } from "./HermiteSpline.js"

export class CatmullRomSpline extends GameObject {

    points: Vector[] = []
    loop: boolean = false

    constructor(points: Vector[]) {

        super()

        this.points = points

    }

    getHermiteSpline(): HermiteSpline {

        if (this.points.length < 3) return null

        let nodes: HermiteSplineNode[] = []

        let points = [...this.points]
        if (this.loop) {
            points.unshift(this.points[this.points.length - 1])
            points.push(this.points[0])
        }

        for (let index = 0; index < points.length - 1; index++) {

            let p_0 = points[index - 1]
            let p_1 = points[index]
            let p_2 = points[index + 1]

            let dir = p_2.clone().sub(p_0).divS(2)

            nodes.push({ position: p_1.clone(), direction: dir })

        }

        return new HermiteSpline(nodes)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        this.getHermiteSpline().executeDraw(ctx)

    }

}