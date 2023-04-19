import { GameObject, Vector } from "../2DGameEngine.js"
import { CubicBezier } from "./CubicBezier.js"
import { CubicBezierSpline } from "./CubicBezierSpline.js"

export interface HermiteSplineNode {

    position: Vector
    direction: Vector

}

export class HermiteSpline extends GameObject {

    nodes: HermiteSplineNode[] = []

    constructor(nodes: HermiteSplineNode[]) {

        super()

        this.nodes = nodes

    }

    getCubicBezierSpline(): CubicBezierSpline {

        let beziers: CubicBezier[] = []

        for (let index = 0; index < this.nodes.length - 1; index++) {
            let node_0 = this.nodes[index]
            let node_1 = this.nodes[index + 1]

            let p0 = node_0.position.clone()
            let p1 = node_1.position.clone()
            let c0 = p0.clone().add(node_0.direction.clone().divS(3))
            let c1 = p1.clone().sub(node_1.direction.clone().divS(3))
            beziers.push(new CubicBezier(p0, c0, c1, p1))
        }

        return new CubicBezierSpline(beziers)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        this.getCubicBezierSpline().executeDraw(ctx)

    }

}