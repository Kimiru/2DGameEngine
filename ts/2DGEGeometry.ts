import { GameObject } from "./2DGameEngine.js"
import { HexagonGraphInterface, HexOrientation, HexVector, TransformMatrix, Vector } from "./2DGEMath.js"

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

    /**
     * Returns a list of points, such that it represents the polygon with theorically no holes. Duplicates the first Vector at the end of the list for practical purposes
     * 
     * @returns {Vector[]}
     */
    getLinear(): Vector[] {

        let points: Vector[] = [...this.outer, this.outer[0]]

        for (let inner of this.inners)
            points.push(...inner, points[0])

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

        let segments = []

        let points = this.getLinear()

        if (points.length < 3) return segments

        for (let index = 0; index < points.length - 1; index++) {
            segments.push(new Segment(points[index].clone(), points[index + 1].clone()))
        }

        return segments

    }

    getWorldSegment(): Segment[] {

        let segments = []

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

        if (this.fill) ctx.fill()
        else ctx.stroke()

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


    static #extractHolesFromPolygon(...polygons: Polygon[]): Vector[][] {

        let results: Vector[][] = []

        for (let polygon of polygons) {

            let line = []

            for (let point of polygon.outer)
                line.push(point.clone())

            results.push(line)

            for (let inner of polygon.inners) {

                line = []

                for (let point of inner)
                    line.push(point.clone())

                results.push(line)

            }



        }

        return results

    }

    static #treatIntersectionInPath(...paths: Vector[][]) {

        let resultingPaths: Vector[][] = []

        for (let path of paths) {

            let points = []

            for (let pathIndex = 0; pathIndex < path.length; pathIndex++) {

                points.push(path[pathIndex])

                let segment = new Segment(
                    path[pathIndex],
                    path[(pathIndex + 1) % path.length]
                )

                for (let comparedPath of paths) {

                    if (path === comparedPath) continue

                    for (let comparedPathIndex = 0; comparedPathIndex < path.length; comparedPathIndex++) {

                        let comparedSegment = new Segment(
                            comparedPath[comparedPathIndex],
                            comparedPath[(comparedPathIndex + 1) % comparedPath.length]
                        )

                        let intersection = segment.intersect(comparedSegment)

                        if (intersection) points.push(intersection)


                    }

                }

            }

            resultingPaths.push(points)

            console.log('points', points)

        }

        return resultingPaths

    }

    static #mapPathToVectorList(...paths: Vector[][]): { paths: number[][], points: Vector[] } {


        let result: { paths: number[][], points: Vector[] } = {
            paths: [],
            points: []
        }

        for (let path of paths) {

            let resultPath: number[] = []

            for (let point of path) {

                let success = false

                for (let index in result.points) {
                    let resultPoint = result.points[index]

                    if (resultPoint.equal(point)) {

                        resultPath.push(Number(index))
                        success = true

                        break

                    }

                }

                if (!success) {

                    resultPath.push(result.points.length)
                    result.points.push(point.clone())

                }

            }

            result.paths.push(resultPath)

        }

        return result

    }

    static clipPolygons(...polygons: Polygon[]) {

        let paths = this.#extractHolesFromPolygon(...polygons)

        let noIntersectionPaths = this.#mapPathToVectorList(...this.#treatIntersectionInPath(...paths))



        console.log(noIntersectionPaths)

    }

    static union(...polygons: Polygon[]) {

    }

    static intersection() {



    }

}

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

export class GridHexagon extends Hexagon implements HexagonGraphInterface {

    hexVector: HexVector

    constructor(hexVector: HexVector = new HexVector()) {

        super(undefined, hexVector.orientation, hexVector.unit)

        this.hexVector = hexVector.clone()
        this.hexVector.vector = this.transform.translation
        this.hexVector.updateVector()

    }

    getLinear(): Vector[] {

        this.orientation = this.hexVector.orientation
        this.unit = this.hexVector.unit

        return super.getLinear()

    }

}

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

export class Ray extends GameObject {

    direction: Vector = new Vector()

    constructor(position: Vector, direction: Vector) {

        super()

        this.transform.translation.copy(position)
        this.direction = direction

    }

    intersect(segment: Segment): Vector {

        let sega = segment.getWorldPosition(segment.a.clone())
        let segb = segment.getWorldPosition(segment.b.clone())
        let wp = this.getWorldPosition()
        let wpdir = this.getWorldPosition(this.direction.clone().normalize())

        let x1 = sega.x
        let y1 = sega.y
        let x2 = segb.x
        let y2 = segb.y

        let x3 = wp.x
        let y3 = wp.y
        let x4 = wpdir.x
        let y4 = wpdir.y

        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

        if (denum === 0) return null

        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum

        if (t < 0 || t > 1 || u < 0) return null

        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1))

    }

    cast(segments: Segment[]): Vector {

        let result: Vector = null
        let length: number = 0

        for (let segment of segments) {

            let intersect = this.intersect(segment)
            if (intersect) {
                let intersectLength = this.transform.translation.distanceTo(intersect)
                if (result === null || intersectLength < length) {
                    result = intersect
                    length = intersectLength
                }
            }

        }

        return result

    }

    draw(ctx: CanvasRenderingContext2D): boolean {


        ctx.strokeStyle = 'blue'
        ctx.strokeRect(-this.transform.scale.x, -this.transform.scale.y, this.transform.scale.x * 2, this.transform.scale.y * 2)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(this.direction.x * this.transform.scale.x * 5, this.direction.y * this.transform.scale.y * 5)
        ctx.stroke()

        return true

    }

}

export class RayCastView {

    static compute(position: Vector, segments: Segment[], infinity = 1000): Polygon {

        let uniques: Vector[] = [
            Vector.fromAngle(Math.PI / 4).multS(infinity),
            Vector.fromAngle(Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI / 4).multS(infinity)
        ]

        for (let segment of segments) {

            let sega = segment.getWorldPosition(segment.a.clone())
            let segb = segment.getWorldPosition(segment.b.clone())

            if (!uniques.some(pt => pt.equal(sega))) uniques.push(sega)
            if (!uniques.some(pt => pt.equal(segb))) uniques.push(segb)

        }

        let points: [number, Vector, Vector][] = []

        for (let unique of uniques) {

            let angle = unique.clone().sub(position).angle()

            let angle1 = angle + 0.00001
            let angle2 = angle - 0.00001

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

        let polygon = new Polygon(points.map(e => e[2]))

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