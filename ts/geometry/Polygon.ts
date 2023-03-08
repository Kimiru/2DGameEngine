import { GameObject } from "../basics/GameObject.js"
import { TransformMatrix } from "../math/TransformMatrix.js"
import { Vector } from "../math/Vector.js"
import { Ray } from "./Ray.js"
import { Segment } from "./Segment.js"

// see https://github.com/tcql/greiner-hormann

class Vertex extends Vector {

    alpha: number = 0.0
    intersect: boolean = false
    entry: boolean = true
    checked: boolean = false
    degenerate: boolean = false
    neighbor: Vertex = null
    next: Vertex = null
    prev: Vertex = null
    type: string = null
    remove: boolean = false

    constructor(x: number, y: number, alpha: number = 0, intersect: boolean = false, degenerate: boolean = false) {

        super(x, y)

        this.alpha = alpha
        this.intersect = intersect
        this.degenerate = degenerate

    }

    setTypeUsing(polygon: Polygon) {

        if (this.type) return

        this.type = polygon.containsVector(this) ? 'in' : 'out'

    }

    pairing(): string {

        return `${this.prev.type}/${this.next.type}`

    }

    entryPairing = function () {

        var entry = this.entry ? 'en' : 'ex'
        var neightborEntry = this.neighbor.entry ? 'en' : 'ex'

        return `${entry}/${neightborEntry}`

    }

}

class Ring {

    first: Vertex = null

    constructor(coordinates: Vector[]) {

        if (!Polygon.isClockwise(coordinates))
            coordinates = [...coordinates].reverse()

        for (let coordinate of coordinates)
            this.push(new Vertex(coordinate.x, coordinate.y))

    }

    push(vertex: Vertex) {

        if (!this.first) {

            this.first = vertex
            this.first.prev = vertex
            this.first.next = vertex

        } else {

            let next: Vertex = this.first
            let prev: Vertex = next.prev
            next.prev = vertex
            vertex.next = next
            vertex.prev = prev
            prev.next = vertex

        }

    }

    insert(vertex: Vertex, start: Vertex, end: Vertex) {
        let currentVertex: Vertex = start.next

        while (currentVertex !== end && currentVertex.alpha < vertex.alpha)
            currentVertex = currentVertex.next

        vertex.next = currentVertex
        let prev: Vertex = currentVertex.prev
        vertex.prev = prev
        prev.next = vertex
        currentVertex.prev = vertex
    }

    nextNonIntersectVertex(start: Vertex) {

        var currentVertex: Vertex = start
        do
            currentVertex = currentVertex.next
        while (currentVertex.intersect && currentVertex !== start)

        return currentVertex
    }

    firstIntersectVertexfunction(): Vertex {
        var currentVertex: Vertex = this.first

        while (true) {

            if (currentVertex.intersect && !currentVertex.checked)
                return currentVertex

            currentVertex = currentVertex.next

            if (currentVertex === this.first)
                break

        }

    }

    firstIntersect(): Vertex {

        var currentVertex = this.first

        do {

            if (currentVertex.intersect && !currentVertex.checked)
                return currentVertex

            currentVertex = currentVertex.next

        } while (currentVertex !== this.first)

    }

    count(predicate: (vertex: Vertex) => boolean = () => true): number {

        let currentVertex: Vertex = this.first
        let count = 0

        do {

            if (predicate(currentVertex)) count++

            currentVertex = currentVertex.next

        } while (currentVertex !== this.first)

        return count

    }

    toArray(): Vertex[] {

        let currentVertex = this.first

        let array = []

        do {

            array.push(currentVertex)

            currentVertex = currentVertex.next

        } while (currentVertex !== this.first)

        return array

    }

}

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

    getOuter(index: number) {

        return this.outer[index % this.outer.length]

    }

    hasInners(): boolean {

        return this.inners.length !== 0

    }

    popInners(): Polygon[] {

        let polygons: Polygon[] = this.inners.map(inner => new Polygon(inner))

        this.inners = []

        return polygons

    }

    transferInnersToOuter(): void {

        let lastVector: Vector = this.outer[this.outer.length - 1]

        for (let inner of this.inners) {

            this.outer.push(...inner)
            this.outer.push(inner[0].clone())
            this.outer.push(lastVector.clone())

        }

        this.inners = []

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

    path(ctx: CanvasRenderingContext2D) {

        ctx.beginPath()
        ctx.moveTo(this.outer[0].x, this.outer[0].y)
        for (let index = 1; index <= this.outer.length; index++) {
            ctx.lineTo(this.outer[index % this.outer.length].x, this.outer[index % this.outer.length].y)
        }
        ctx.closePath()

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


    // clipping operation



    static GreinerHormann(subject: Polygon, clipper: Polygon, subjectForward: boolean, clipperForward: boolean): Polygon[] {

        if (subject.hasInners() || clipper.hasInners()) {

            subject = subject.clone()
            let subjectInners = subject.popInners()

            clipper = clipper.clone()
            let clipperInners = clipper.popInners()

            let resultingPolygons = this.GreinerHormann(subject, clipper, subjectForward, clipperForward)

            let subjectInnersClipped = subjectInners.map(polygon => this.GreinerHormann(polygon, clipper,
                subjectForward, clipperForward)).flat()

            let clipperInnersClipped = clipperInners.map(polygon => this.GreinerHormann(polygon, subject,
                subjectForward, clipperForward)).flat()

            if (resultingPolygons.length === 1) {

                resultingPolygons[0].inners.push(
                    ...subjectInnersClipped.map(poly => [...poly.outer]),
                    ...clipperInnersClipped.map(poly => [...poly.outer]))

            }

            return resultingPolygons
        }


        let subjectRing: Ring = new Ring(subject.outer)
        let clipperRing: Ring = new Ring(clipper.outer)

        this.#computeInterections(subjectRing, clipperRing, subject, clipper)
        this.#markDegeneratesAsIntersections(subjectRing)

        let result = this.#checkQuitCases(subjectRing, clipperRing, subject, clipper, this.#getMode(subjectForward, clipperForward))
        if (result) return result

        this.#setEntryVertexAndExitVertex(subjectRing)


        return this.#buildPolygons(subjectRing, subjectForward, clipperForward)

    }

    static #getMode(subjectForward: boolean, clipperForward: boolean): string {

        if (subjectForward)
            if (clipperForward) return 'intersect'
            else return 'substractA'
        else
            if (clipperForward) return 'substractB'
            else return 'union'

    }

    static #computeInterections(subjectRing: Ring, clipperRing: Ring, subject: Polygon, clipper: Polygon) {

        let subjectCurrentVertex = subjectRing.first

        do {

            subjectCurrentVertex.setTypeUsing(clipper)

            let clipperCurrentVertex = clipperRing.first

            if (!subjectCurrentVertex.intersect)
                do {

                    clipperCurrentVertex.setTypeUsing(subject)

                    if (!clipperCurrentVertex.intersect) {

                        let subjectSegmentEnd = subjectRing.nextNonIntersectVertex(subjectCurrentVertex)
                        let clipperSegmentEnd = clipperRing.nextNonIntersectVertex(clipperCurrentVertex)

                        let subjectSegment = new Segment(subjectCurrentVertex, subjectSegmentEnd)
                        let clipperSegment = new Segment(clipperCurrentVertex, clipperSegmentEnd)

                        let intersectionVector = subjectSegment.intersect(clipperSegment)

                        if (intersectionVector) {

                            let subjectAlpha = subjectCurrentVertex.distanceTo(intersectionVector) / subjectSegment.length()
                            let clipperAlpha = clipperCurrentVertex.distanceTo(intersectionVector) / clipperSegment.length()

                            clipperCurrentVertex = this.#handleIntersection(subjectRing, clipperRing, subjectCurrentVertex, subjectSegmentEnd, clipperCurrentVertex, clipperSegmentEnd, intersectionVector, subjectAlpha, clipperAlpha)

                        }

                    }

                    clipperCurrentVertex = clipperCurrentVertex.next

                } while (clipperCurrentVertex !== clipperRing.first)

            subjectCurrentVertex = subjectCurrentVertex.next

        } while (subjectCurrentVertex !== subjectRing.first)

    }

    static #handleIntersection(subjectRing: Ring, clipperRing: Ring, subjectSegmentStart: Vertex, subjectSegmentEnd: Vertex, clipperSegmentStart: Vertex, clipperSegmentEnd: Vertex, intersectionVector: Vector, subjectAlpha: number, clipperAlpha: number): Vertex {

        let subjectBetween = 0 < subjectAlpha && subjectAlpha < 1
        let clipperBetween = 0 < clipperAlpha && clipperAlpha < 1

        let subjectVertex: Vertex, clipperVertex: Vertex

        // If all is fine
        if (subjectBetween && clipperBetween) {

            // Insert vertex into rings

            subjectVertex = new Vertex(intersectionVector.x, intersectionVector.y, subjectAlpha, true)
            subjectRing.insert(subjectVertex, subjectSegmentStart, subjectSegmentEnd)

            clipperVertex = new Vertex(intersectionVector.x, intersectionVector.y, clipperAlpha, true)
            clipperRing.insert(clipperVertex, clipperSegmentStart, clipperSegmentEnd)


        } else {

            // Handle bad stuff

            if (subjectBetween) {

                subjectVertex = new Vertex(intersectionVector.x, intersectionVector.y, subjectAlpha, true, true)
                subjectRing.insert(new Vertex(intersectionVector.x, intersectionVector.y, subjectAlpha, true), subjectSegmentStart, subjectSegmentEnd)

            }

            else if (subjectAlpha === 0) {

                subjectSegmentStart.intersect = true
                subjectSegmentStart.degenerate = true
                subjectSegmentStart.alpha = subjectAlpha

                subjectVertex = subjectSegmentStart

            }

            else if (subjectAlpha === 1) {

                subjectSegmentEnd.intersect = false
                subjectSegmentEnd.degenerate = true
                subjectSegmentEnd.alpha = subjectAlpha

                subjectVertex = subjectSegmentEnd

            }

            if (clipperBetween) {

                clipperVertex = new Vertex(intersectionVector.x, intersectionVector.y, clipperAlpha, true, true)
                clipperRing.insert(new Vertex(intersectionVector.x, intersectionVector.y, clipperAlpha, true), clipperSegmentStart, clipperSegmentEnd)

            }

            else if (clipperAlpha === 0) {

                clipperSegmentStart.intersect = true
                clipperSegmentStart.degenerate = true
                clipperSegmentStart.alpha = clipperAlpha

                clipperVertex = clipperSegmentStart

            }

            else if (clipperAlpha === 1) {

                clipperSegmentEnd.intersect = false
                clipperSegmentEnd.degenerate = true
                clipperSegmentEnd.alpha = clipperAlpha

                clipperVertex = clipperSegmentEnd

                if (clipperSegmentStart.next !== clipperRing.first)
                    clipperSegmentStart = clipperSegmentStart.next

            }

        }

        if (!subjectVertex.intersect) clipperVertex.intersect = false
        if (!clipperVertex.intersect) subjectVertex.intersect = false




        if (subjectVertex && clipperVertex) {

            subjectVertex.neighbor = clipperVertex
            clipperVertex.neighbor = subjectVertex

            subjectVertex.type = clipperVertex.type = 'on'

        }

        return clipperSegmentStart

    }

    static #markDegeneratesAsIntersections(ring: Ring) {

        let currentVertex = ring.first

        do {

            if (currentVertex.degenerate)
                currentVertex.intersect = true

            currentVertex = currentVertex.next

        } while (currentVertex !== ring.first)

    }

    static #checkQuitCases(subjectRing: Ring, clipperRing: Ring, subject: Polygon, clipper: Polygon, mode: string): Polygon[] {

        let subjectVertexCount = subjectRing.count()
        let clipperVertexCount = clipperRing.count()

        // If no intersection
        if (subjectRing.count(v => v.intersect) === 0) {

            if (mode === 'union') {

                if (subjectRing.count(v => v.type === 'in') === subjectVertexCount)
                    return [clipper]

                else if (clipperRing.count(v => v.type === 'in') === clipperVertexCount)
                    return [subject]

                let polygone = subject.clone()
                polygone.inners.push([...clipper.outer].reverse())

                return [polygone]

            }

            else if (mode === 'intersect') return []

            else if (mode === 'subtractB') {

                if (clipperRing.first.type === 'in') {

                    let polygone = subject.clone()
                    polygone.inners.push([...clipper.outer].reverse())

                    return [polygone]

                }
                else if (subjectRing.count(v => v.type === 'in'))
                    return []

                return [subject.clone()]

            }

            else if (mode === 'subtractA') {

                if (subjectRing.first.type === 'in') {
                    let polygone = clipper.clone()
                    polygone.inners.push([...subject.outer].reverse())

                    return [polygone]
                }
                else if (clipperRing.count(v => v.type === 'in'))
                    return []

                return [clipper.clone()]

            }

        }

        if (subjectRing.count(v => v.degenerate) === subjectVertexCount && subjectRing.count(v => v.intersect) === 1) {

            if (mode === 'subtractA') {

                if (clipperRing.count(v => v.degenerate) === clipperVertexCount)
                    return []

                return [clipper.clone()]

            }

            else if (mode === 'substractB') {

                if (clipperRing.count(v => v.degenerate) === clipperVertexCount)
                    return []

                return [subject.clone()]

            }

            return [subject.clone()]

        }

    }

    static #setEntryVertexAndExitVertex(ring: Ring) {

        let currentVertex = ring.first

        do {

            if (currentVertex.intersect && currentVertex.neighbor) {

                this.#handleEntryExitVertex(currentVertex)
                this.#handleEntryExitVertex(currentVertex.neighbor)

                switch (currentVertex.entryPairing()) {
                    case 'en/en':
                        currentVertex.remove = true
                        currentVertex.type = 'in'
                        currentVertex.neighbor.type = 'in'
                        currentVertex.intersect = false
                        currentVertex.neighbor.intersect = false
                        break

                    case 'ex/ex':
                        currentVertex.remove = true
                        currentVertex.type = 'out'
                        currentVertex.neighbor.type = 'out'
                        currentVertex.intersect = false
                        currentVertex.neighbor.intersect = false
                        break
                }

            }

            currentVertex = currentVertex.next

        } while (currentVertex !== ring.first)

    }

    static #handleEntryExitVertex(vertex: Vertex) {

        let pairing = vertex.pairing()

        switch (pairing) {
            case 'in/out':
            case 'on/out':
            case 'in/on':
                vertex.entry = false
                break

            case 'out/in':
            case 'on/in':
            case 'out/on':
                vertex.entry = true
                break

            case 'out/out':
            case 'in/in':
            case 'on/on':

                let neighborPairing = vertex.neighbor.pairing()

                if (neighborPairing === 'out/out' || neighborPairing === 'in/in' || neighborPairing === 'on/on' || (pairing === 'on/on' && neighborPairing === 'on/out' && vertex.degenerate)) {

                    vertex.remove = true
                    vertex.neighbor.remove = true
                    vertex.neighbor.intersect = false
                    vertex.intersect = false

                } else {

                    this.#handleEntryExitVertex(vertex.neighbor)
                    vertex.entry = !vertex.neighbor.entry

                }
                break

            default:
                console.error('UNKNOWN TYPE', vertex.pairing())

        }

    }

    static #buildPolygons(ring: Ring, subjectForward: boolean, clipperForward: boolean): Polygon[] {

        let currentVertex: Vertex = ring.first

        type Poly = { poly: Polygon, isHole: Boolean }
        let polygonList: Poly[] = []
        let onClip = false
        let entryDir = 'next'
        let exitDir = 'prev'

        while ((currentVertex = ring.firstIntersect())) {

            let poly = [new Vector(currentVertex.x, currentVertex.y)]

            do {

                if (onClip) {

                    entryDir = clipperForward ? 'next' : 'prev'
                    exitDir = clipperForward ? 'prev' : 'next'

                } else {

                    entryDir = subjectForward ? 'next' : 'prev'
                    exitDir = subjectForward ? 'prev' : 'next'

                }

                currentVertex.checked = true

                if (currentVertex.neighbor)
                    currentVertex.neighbor.checked = true

                if (currentVertex.entry) do {

                    currentVertex = currentVertex[entryDir]

                    poly.push(new Vector(currentVertex.x, currentVertex.y))

                } while (!currentVertex.intersect)

                else do {

                    currentVertex = currentVertex[exitDir]

                    poly.push(new Vector(currentVertex.x, currentVertex.y))

                } while (!currentVertex.intersect)

                currentVertex = currentVertex.neighbor
                onClip = !onClip

            } while (!currentVertex.checked)

            let polygon = new Polygon(poly)

            polygonList.push({ poly: polygon, isHole: false })

        }

        let graph: Map<Poly, Poly[]> = new Map()

        for (let polygon of polygonList) {

            if (!graph.has(polygon)) graph.set(polygon, [])

            for (let subPolygon of polygonList) {

                if (polygon === subPolygon) continue

                if (polygon.poly.containsVector(subPolygon.poly.outer[0])) {

                    graph.get(polygon).push(subPolygon)
                    subPolygon.isHole = true

                }

            }

        }

        let result: Polygon[] = []

        for (let entry of graph.entries()) {

            if (entry[0].isHole) continue

            let polygon: Polygon = entry[0].poly

            for (let subPolygon of entry[1])
                polygon.inners.push([...subPolygon.poly.outer].reverse())

            result.push(polygon)

        }

        return result

    }




}