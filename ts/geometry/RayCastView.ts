import { Vector } from "../math/Vector.js"
import { Polygon } from "./Polygon.js"
import { Ray } from "./Ray.js"
import { Segment } from "./Segment.js"

export class RayCastView {

    static compute(position: Vector, segments: Segment[], infinity: number = 1000, infinityPoints: number = 4, centeredOnPosition: boolean = true): Polygon {

        let border: Vector[] = []

        infinityPoints = Math.max(infinityPoints, 4)

        for (let index = 0; index < infinityPoints; index++)
            border.push(Vector.fromAngle(Math.PI * 2 / infinityPoints * index + Math.PI / 4).multS(infinity).add(centeredOnPosition ? position : new Vector()))

        segments = [...segments]
        for (let index = 0; index < infinityPoints; index++)
            segments.push(new Segment(border[index], border[(index + 1) % infinityPoints]))

        let uniques: Vector[] = []

        for (let segment of segments) {

            let sega = segment.getWorldPosition(segment.a.clone())
            let segb = segment.getWorldPosition(segment.b.clone())

            if (!uniques.some(pt => pt.equal(sega))) uniques.push(sega)
            if (!uniques.some(pt => pt.equal(segb))) uniques.push(segb)

        }


        let points: [number, Vector, Vector][] = []

        for (let unique of uniques) {

            let angle = unique.clone().sub(position).angle()

            let delta = 0.00001

            let angle1 = angle + delta
            let angle2 = angle - delta

            let ray = new Ray(position.clone(), Vector.fromAngle(angle))
            let ray1 = new Ray(position.clone(), Vector.fromAngle(angle1))
            let ray2 = new Ray(position.clone(), Vector.fromAngle(angle2))

            let pt = ray.cast(segments)
            let pt1 = ray1.cast(segments)
            let pt2 = ray2.cast(segments)


            points.push([angle, pt ?? position.clone().add(ray.direction.multS(infinity)), pt?.clone().sub(position) ?? ray.direction])

            points.push([angle1, pt1 ?? position.clone().add(ray1.direction.multS(infinity)), pt1?.clone().sub(position) ?? ray1.direction])

            points.push([angle2, pt2 ?? position.clone().add(ray2.direction.multS(infinity)), pt2?.clone().sub(position) ?? ray2.direction])

        }

        points.sort((a, b) => b[0] - a[0])

        let polygon = new Polygon(points.map(e => e[2].add(position)))

        return polygon

    }

    static cropPolygon(ctx: CanvasRenderingContext2D, polygon: Polygon): void {

        let points = polygon.getLinear()

        if (points.length < 4) return

        ctx.globalCompositeOperation = 'destination-in'
        ctx.fillStyle = 'white'

        ctx.beginPath()

        ctx.moveTo(points[0].x, points[0].y)
        for (let index = 1; index < points.length - 1; index++)
            ctx.lineTo(points[index].x, points[index].y)

        ctx.fill()

        ctx.globalCompositeOperation = 'source-over'

    }

}