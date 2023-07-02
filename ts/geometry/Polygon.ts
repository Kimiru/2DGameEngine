import { GameObject } from "../basics/GameObject.js"
import { TransformMatrix } from "../math/TransformMatrix.js"
import { Vector } from "../math/Vector.js"
import { Ray } from "./Ray.js"
import { Segment } from "./Segment.js"
import clipperlib from 'clipper-lib'

globalThis.ClipperLib = clipperlib

import 'clipper-lib'

declare global {
    interface Window {
        ClipperLib: {
            Clipper: new () => Clipper,
            PolyType: { ptSubject: 0, ptClip: 1 },
            ClipType: { ctIntersection: 0, ctUnion: 1, ctDifference: 2, ctXor: 3 },
            PolyFillType: { pftEvenOdd: 0, pftNonZero: 1, pftPositive: 2, pftNegative: 3 }
        }
    }
}


export type Clipper = {
    AddPaths: (paths: clipperpaths, polytype: polytype, closed: boolean) => void,
    Execute: (cliptype: cliptype, solution: clipperpaths, subjFillType: polyfilltype, clipFillType: polyfilltype) => void
}
export type cliptype = number
export type polytype = number
export type polyfilltype = number

export type clipperpoint = { X: number, Y: number }
export type clipperpath = clipperpoint[]
export type clipperpaths = clipperpath[]

/**
 * The Polygon represent a N point polygon
 * To work properly, it needs at least 3 point to close
 */
export class Polygon extends GameObject {

    #points: Vector[] = []

    outer: Vector[] = []
    inners: Vector[][] = []

    fill: boolean = false

    /**
     * Create a new polygon using the given points
     * 
     * @param points 
     */
    constructor(outer: Vector[] = [], ...inners: Vector[][]) {

        super()

        this.addTag('polygon')

        this.outer = outer
        this.inners = inners

    }

    static isClockwise(vectors: Vector[]): boolean {

        let sum = 0

        for (let index_0 = 0; index_0 < vectors.length; index_0++) {

            let index_1 = (index_0 + 1) % vectors.length

            let vec_0 = vectors[index_0]
            let vec_1 = vectors[index_1]

            sum += ((vec_1.x - vec_0.x) * (vec_1.y + vec_0.y))

        }

        return sum > 0

    }

    clone() {

        return new Polygon([...this.outer], ...this.inners.map(inner => inner.map(vec => vec.clone())))

    }

    /**
     * Returns a list of points, such that it represents the polygon with theorically no holes. Duplicates the first Vector at the end of the list for practical purposes
     * 
     * @returns {Vector[]}
     */
    getLinear(): Vector[] {

        let points: Vector[] = [...this.outer, this.outer[0]]

        return points

    }

    getWorldLinear() {

        let matrix = this.getWorldTransformMatrix()

        let points = this.getLinear()

        return points.map(point => TransformMatrix.multVec(matrix, point))

    }

    /**
     * Get the list of segments between the points in order
     * Returns an empty list if there is only one point
     * 
     * @returns {Segment[]}
     */
    getSegments(): Segment[] {

        let segments: Segment[] = []

        let points = this.getLinear()

        if (points.length < 3) return segments

        for (let index = 0; index < points.length - 1; index++) {
            segments.push(new Segment(points[index].clone(), points[index + 1].clone()))
        }

        return segments

    }

    getWorldSegment(): Segment[] {

        let segments: Segment[] = []

        let points = this.getWorldLinear()

        if (points.length < 2) return segments

        for (let index = 0; index < points.length; index++) {
            segments.push(new Segment(points[index].clone(), points[(index + 1) % points.length].clone()))
        }

        return segments

    }

    /**
     * Draw the polygon
     * Should not be called by the user
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx: CanvasRenderingContext2D) {

        if (this.outer.length < 3) return

        ctx.fillStyle = ctx.strokeStyle = 'yellow'
        ctx.lineWidth = .1

        this.path(ctx)

        if (this.fill) ctx.fill()
        else ctx.stroke()

    }

    path(ctx: CanvasRenderingContext2D) {

        ctx.beginPath()
        ctx.moveTo(this.outer[0].x, this.outer[0].y)
        for (let index = 1; index <= this.outer.length; index++) {
            ctx.lineTo(this.outer[index % this.outer.length].x, this.outer[index % this.outer.length].y)
        }
        ctx.closePath()

        for (let inner of this.inners) {

            ctx.moveTo(inner[0].x, inner[0].y)

            for (let index = 1; index <= inner.length; index++)
                ctx.lineTo(inner[index % inner.length].x, inner[index % inner.length].y)
            ctx.closePath()

        }

    }

    containsVector(vector: Vector): boolean {

        let segments = this.getSegments()

        let count = 0

        let ray = new Ray(vector, new Vector(1, 0))

        for (let segment of segments) if (ray.intersect(segment)) count++

        return (count & 1) === 1

    }

    containsWorldVector(vector: Vector): boolean {

        let segments = this.getWorldSegment()

        let count = 0

        let ray = new Ray(vector, new Vector(1, 0))

        for (let segment of segments) if (ray.intersect(segment)) count++

        return (count & 1) === 1

    }

    get clipperpaths(): clipperpaths {

        return [
            this.outer.map(v => ({ X: v.x, Y: v.y })),
            ...this.inners.map(vs => vs.map(v => ({ X: v.x, Y: v.y })))
        ]

    }

    // set polybool(polybool: polybool) {

    //     this.outer = polybool.regions[0].map(point => new Vector(...point))
    //     this.inners = polybool.regions.slice(1).map(region => region.map(point => new Vector(...point)))

    // }


    static clip(sourcePaths: clipperpaths, clippingPaths: clipperpaths, clipType: cliptype,
        subjectPolyFillType: polyfilltype = window.ClipperLib.PolyFillType.pftEvenOdd, clipperPolyFillType: polyfilltype = window.ClipperLib.PolyFillType.pftEvenOdd): clipperpaths {

        let clipper = new window.ClipperLib.Clipper()

        clipper.AddPaths(sourcePaths, window.ClipperLib.PolyType.ptSubject, true)
        clipper.AddPaths(clippingPaths, window.ClipperLib.PolyType.ptClip, true)

        let solution = []

        let success = clipper.Execute(clipType, solution, subjectPolyFillType, clipperPolyFillType)

        return solution


    }

    static union(source: clipperpaths, clipper: clipperpaths): clipperpaths {

        return this.clip(source, clipper, window.ClipperLib.ClipType.ctUnion)

    }

    static intersect(source: clipperpaths, clipper: clipperpaths): clipperpaths {

        return this.clip(source, clipper, window.ClipperLib.ClipType.ctIntersection)

    }

    static difference(source: clipperpaths, clipper: clipperpaths): clipperpaths {

        return this.clip(source, clipper, window.ClipperLib.ClipType.ctDifference)

    }

    // static differenceRev(source: Polygon[], clipper: Polygon[]): Polygon[] {

    //     return this.#clip(source, clipper, window.PolyBool.differenceRev)

    // }

    // static xor(source: Polygon[], clipper: Polygon[]): Polygon[] {

    //     return this.#clip(source, clipper, window.PolyBool.xor)

    // }


    // Scale float to reduce precision loss

    static deFloat(paths: clipperpaths, precision: number = 6): clipperpaths {

        let ratio = 10 ** precision

        return paths.map(
            region => region.map(
                point => ({
                    X: Math.round(point.X * ratio),
                    Y: Math.round(point.Y * ratio)
                })
            )
        )

    }

    static inFloat(paths: clipperpaths, precision: number = 6): clipperpaths {

        let ratio = 10 ** precision

        return paths.map(
            region => region.map(
                point => ({
                    X: point.X / ratio,
                    Y: point.Y / ratio
                })
            )
        )

    }

    static pathClipperPaths(ctx: CanvasRenderingContext2D, clipperpaths: clipperpaths) {

        ctx.beginPath()
        for (let clipperpath of clipperpaths) {
            for (let [index, { X, Y }] of clipperpath.entries()) {
                if (!index) ctx.moveTo(X, Y)
                else ctx.lineTo(X, Y)
            }
            ctx.closePath()
        }

    }

}