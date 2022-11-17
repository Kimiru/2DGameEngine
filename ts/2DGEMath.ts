import { range } from "./2DGEUtils.js"

export type matrix = [number, number, number, number, number, number]
const PI2 = Math.PI * 2

/**
 * class Vector represent a 3 dimentional vector
 * it also contains function that are used in 2d context for practical purposes
 */
export class Vector {

    x: number = 0
    y: number = 0
    z: number = 0

    /**
     * Create a new 3D Vector
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x: number = 0, y: number = 0, z: number = 0) {

        this.x = x
        this.y = y
        this.z = z

    }

    /**
    * Set this vector values to the given values
    * 
    * @param {number} x 
    * @param {number} y 
    * @param {number} z
    * @returns {this}
    */
    set(x: number = 0, y: number = 0, z: number = 0): this {

        this.x = x
        this.y = y
        this.z = z

        return this

    }

    /**
     * Add the given vector to this vector
     * 
     * @param {Vector} vector 
     * @returns {this}
     */
    add(vector: Vector = new Vector()): this {

        this.x += vector.x
        this.y += vector.y
        this.z += vector.z

        return this

    }

    /**
     * Add the given numbers to this vector
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     * @returns {this}
     */
    addS(x: number = 0, y: number = 0, z: number = 0): this {

        this.x += x
        this.y += y
        this.z += z

        return this

    }

    /**
     * Sub the given vector to this vector
     * 
     * @param {Vector} vector 
     * @returns {this}
     */
    sub(vector: Vector = new Vector()): this {

        this.x -= vector.x
        this.y -= vector.y
        this.z -= vector.z

        return this

    }

    /**
    * Sub the given numbers to this vector
    * 
    * @param {number} x 
    * @param {number} y 
    * @param {number} z
    * @returns {this}
    */
    subS(x: number = 0, y: number = 0, z: number = 0) {

        this.x -= x
        this.y -= y
        this.z -= z

        return this

    }

    /**
     * Multiply each of this vector value by each of the given vector value
     * 
     * @param {Vector} vector 
     * @returns {this}
     */
    mult(vector: Vector): this {

        this.x *= vector.x
        this.y *= vector.y
        this.z *= vector.z

        return this

    }

    /**
     * Multiply this vector by a given value
     * 
     * @param {number} n 
     * @returns {this}
     */
    multS(n: number): this {

        this.x *= n
        this.y *= n
        this.z *= n

        return this

    }

    /**
    * Divide each of this vector value by each of the given vector value
    * 
    * @param {Vector} vector 
    * @returns {this}
    */
    div(vector: Vector): this {

        this.x /= vector.x
        this.y /= vector.y
        this.z /= vector.z

        return this

    }

    /**
     * Divide this vector by a given value
     * 
     * @param {number} n 
     * @returns {this} 
     */
    divS(n: number): this {

        this.x /= n
        this.y /= n
        this.z /= n

        return this

    }

    /**
     * Returns the result of the dot product between this vector and the given vector
     * 
     * @param {Vector} vector 
     * @returns {number}
     */
    dot(vector: Vector): number { return this.x * vector.x + this.y * vector.y + this.z * vector.z }

    /**
     * Returns the length of this vector
     * 
     * @returns {number}
     */
    length(): number { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) }

    /**
     * Returns true if the length of this vector is 0
     * 
     * @returns {boolean}
     */
    nil(): boolean { return this.x == 0 && this.y == 0 && this.z == 0 }

    /**
     * Normalizes this vector if it is not nil
     * 
     * @returns {this}
     */
    normalize(): this {

        if (!this.nil())
            this.divS(this.length())

        return this

    }

    /**
     * Rotates the current vector of a given angle on the x and y values
     * 
     * @param {number} angle 
     * @returns {this}
     */
    rotate(angle: number): this {

        let cos = Math.cos(angle)
        let sin = Math.sin(angle)

        let x = cos * this.x - sin * this.y
        let y = sin * this.x + cos * this.y

        this.x = x
        this.y = y

        return this

    }

    /**
     * Rotate the current vector of a given angle arround a given position on the x and y values
     * 
     * @param {Vector} position 
     * @param {number} angle 
     * @returns {this}
     */
    rotateAround(position: Vector, angle: number): this {

        this.sub(position)
        this.rotate(angle)
        this.add(position)

        return this

    }

    /**
     * Returns the angle between this vector and the given vector
     * 
     * @param vector 
     * @returns {number}
     */
    angleTo(vector: Vector): number { return Math.acos(this.dot(vector) / (this.length() * vector.length())) }

    /**
     * Returns the angle on this vector on plane x, y
     * 
     * @returns {number}
     */
    angle(): number {

        let vec = this.clone().normalize()
        return Math.acos(vec.x) * Math.sign(vec.y)

    }

    /**
     * Returns the distance from this Vector position to the given Vector position
     * 
     * @param {Vector} vector 
     * @returns {number}
     */
    distanceTo(vector: Vector): number { return this.clone().sub(vector).length() }

    /**
     * Copy the given vector values to this vector
     * 
     * @param {Vector} vector 
     */
    copy(vector: Vector): this {

        this.x = vector.x
        this.y = vector.y
        this.z = vector.z

        return this

    }

    /**
     * A new instance clone of this vector
     * 
     * @returns {Vector}
     */
    clone() { return new Vector(this.x, this.y, this.z) }

    /**
     * Returns true if this vector values are equal to the given vector values
     * 
     * @param {Vector} vector 
     * @returns {boolean}
     */
    equal(vector: Vector): boolean { return this.x == vector.x && this.y == vector.y && this.z == vector.z }

    /**
     * Returns true if this vector values are equal to the given values
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     * @returns {boolean}
     */
    equalS(x: number = 0, y: number = 0, z: number = 0): boolean { return this.x == x && this.y == y && this.z == z }

    /**
     * Converts this vector to a string
     * 
     * @returns {string}
     */
    toString() { return `Vector(${this.x}, ${this.y}, ${this.z})` }

    /**
     * Returns a new unit vector from the given angle
     * 
     * @param {number} angle 
     * @returns {Vector}
     */
    static fromAngle(angle: number): Vector { return new Vector(Math.cos(angle), Math.sin(angle)) }

    static distanceBetween(a: Vector, b: Vector) { return a.distanceTo(b) }

    exec(func: (vec: Vector) => void): this {

        func(this)

        return this

    }

    /**
     * 
     * @returns {this}
     */
    round(): this {

        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
        this.z = Math.round(this.z)

        return this

    }

    /**
     * 
     * @returns {this}
     */
    floor(): this {

        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)
        this.z = Math.floor(this.z)

        return this

    }

    abs() {

        this.x = Math.abs(this.x)
        this.y = Math.abs(this.y)
        this.z = Math.abs(this.z)

        return this

    }

}

export class Transform {

    translation: Vector = new Vector()
    #rotation: number = 0
    scale: Vector = new Vector()

    constructor(translation: Vector = new Vector(0, 0, 0), rotation: number = 0, scale: Vector = new Vector(1, 1, 1)) {

        this.translation.copy(translation)
        this.rotation = rotation
        this.scale.copy(scale)

    }

    /**
    * Return the rotation of the object
    * 
    * @returns {number}
    */
    get rotation() { return this.#rotation }

    /**
     * Set the rotation of the object
     * The angle is automatically converted into modulo 2.PI > 0
     * 
     * @param {number} angle
     */
    set rotation(angle: number) {

        this.#rotation = ((angle % PI2) + PI2) % PI2

    }

    clear() {

        this.translation.set(0, 0, 0)
        this.rotation = 0
        this.scale.set(1, 1, 1)

    }

    isDefault(): boolean {

        return this.translation.x === 0 && this.translation.y === 0 &&
            this.#rotation == 0 &&
            this.scale.x === 1 && this.scale.y === 1

    }

    getMatrix(): matrix {

        let cos = Math.cos(this.#rotation)
        let sin = Math.sin(this.#rotation)
        let sx = this.scale.x
        let sy = this.scale.y
        let x = this.translation.x
        let y = this.translation.y

        return [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ]

    }

    getInvertMatrix(): matrix {

        let cos = Math.cos(-this.#rotation)
        let sin = Math.sin(-this.#rotation)
        let sx = 1 / this.scale.x
        let sy = 1 / this.scale.y
        let x = -this.translation.x * cos * sx + -this.translation.x * -sin * sx
        let y = -this.translation.y * sin * sy + -this.translation.y * cos * sy

        return [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ]

    }

    toString() {

        let str = 'Transform( '

        if (this.translation.x !== 0 || this.translation.y !== 0) str += this.translation.toString() + ' '
        if (this.rotation !== 0) str += this.rotation + ' '
        if (this.scale.x !== 1 || this.scale.y !== 1) str += this.scale.toString() + ' '

        str += ')'

        return str

    }

}

export class PositionIntegrator {

    previousPosition: Vector = new Vector()
    previousVelocity: Vector = new Vector()
    previousAcceleration: Vector = new Vector()
    position: Vector = new Vector()
    velocity: Vector = new Vector()
    acceleration: Vector = new Vector()

    constructor() { }

    integrate(t: number) {

        let tt = t * t

        this.previousPosition.copy(this.position)
        this.previousVelocity.copy(this.velocity)
        this.previousAcceleration.copy(this.acceleration)
        this.position
            .add(this.velocity.clone().multS(t))
            .add(this.acceleration.clone().multS(tt * 1 / 2))

        this.velocity.add(this.acceleration.clone().multS(t))

    }

    positionHasChanged() { return !this.previousPosition.equal(this.position) }

    velocityHasChanged() { return !this.previousVelocity.equal(this.velocity) }

    accelerationHasChanged() { return !this.previousAcceleration.equal(this.acceleration) }

}

export class TransformMatrix {

    static multMat(m1: matrix, m2: matrix): matrix {

        return [

            m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5]

        ]

    }

    /**
     * Multiply the given matrix by the given Vector. Mutation safe
     * 
     * @param m1 
     * @param vec 
     * @returns 
     */
    static multVec(m1: matrix, vec: Vector): Vector {

        return new Vector(
            m1[0] * vec.x + m1[2] * vec.y + m1[4],
            m1[1] * vec.x + m1[3] * vec.y + m1[5],
            0
        )

    }

}

export class Graph<T> {

    nodes: Set<number> = new Set()
    nodesObjects: Map<number, T> = new Map()
    links: Map<number, Set<number>> = new Map()
    display: boolean = false
    positionGetter: (object: T) => Vector = null

    constructor(display: boolean = false, positionGetter: (object: T) => Vector = null) {

        this.display = display
        this.positionGetter = positionGetter

    }

    /**
     * 
     * @param {...number} nodes 
     */
    addNode(...nodes: [number, T][]) {

        for (let [node, object] of nodes) {

            if (!this.nodes.has(node)) {

                this.nodes.add(node)
                this.nodesObjects.set(node, object)
                this.links.set(node, new Set())

            }

        }

    }

    /**
     * 
     * @param {...number} nodes 
     */
    removeNode(...nodes: number[]) {

        for (let node of nodes)
            if (this.hasNode(node)) {

                this.nodes.delete(node)
                this.nodesObjects.delete(node)
                this.links.delete(node)

                for (let [, map] of this.links)
                    map.delete(node)

            }

    }

    /**
     * 
     * @param {number} node 
     * @returns {boolean}
     */
    hasNode(node: number) { return this.nodes.has(node) }

    /**
     * 
     * @param {...{source:number, target:number, data:any}} links 
     */
    addLink(...links: { source: number, target: number }[]) {

        for (let link of links) {

            if (!this.hasNode(link.source) || !this.hasNode(link.target)) continue

            this.links.get(link.source).add(link.target)

        }

    }

    /**
     * 
     * @param {...{source:number, target:number}} links 
     */
    removeLink(...links: { source: number, target: number }[]) {

        for (let link of links)
            if (this.hasLink(link.source, link.target)) {

                this.links.get(link.source).delete(link.target)

            }

    }

    hasLink(source: number, target: number) { return this.links.has(source) && this.links.get(source).has(target) }

    isConnectedTo(source: number, target: number): boolean {

        if (!this.hasNode(source)) return false
        if (!this.hasNode(target)) return false

        let nodeSet: Set<number>
        let currentSet: Set<number> = new Set([source])

        do {

            nodeSet = currentSet
            currentSet = new Set(nodeSet)

            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target)

        } while (nodeSet.size != currentSet.size)

        return nodeSet.has(target)
    }

    isConnected(node: number): boolean {

        if (!this.hasNode(node)) return true

        let nodeSet: Set<number>
        let currentSet: Set<number> = new Set([node])

        do {

            nodeSet = currentSet
            currentSet = new Set(nodeSet)

            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target)

        } while (nodeSet.size != currentSet.size)

        return nodeSet.size == this.nodes.size

    }

    isFullyConnected(): boolean {

        for (let node of this.nodes)
            if (!this.isConnected(node)) return false

        return true

    }

    getShortestPathBetween(source: number, target: number, estimateDistance: (nodeA: T, nodeB: T) => number) {

        if (!this.hasNode(source) || !this.hasNode(target)) return null

        let nodes: Map<number, Node> = new Map()
        this.nodes.forEach(id => nodes.set(id, new Node(id)))

        let start = nodes.get(source)
        let end = nodes.get(target)

        let closed = []
        let opened = [start]

        while (opened.length) {

            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.heuristic < b.heuristic ? a : b)), 1)[0]
            let currentObject = this.nodesObjects.get(current.id)

            if (current == end) {

                let list = [end.id]
                let node = end

                while (node.previous) {

                    node = node.previous
                    list.push(node.id)

                }

                return list.reverse()

            }

            for (let neighbour of this.links.get(current.id)) {

                let node = nodes.get(neighbour)
                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id))

                if (!(closed.includes(node) || (opened.includes(node) && node.cost <= cost))) {

                    node.cost = cost
                    node.heuristic = node.cost + estimateDistance(this.nodesObjects.get(node.id), this.nodesObjects.get(end.id))
                    node.previous = current
                    opened.push(node)

                }

            }

            closed.push(current)

        }

        return null

    }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.display && this.positionGetter) {

            ctx.save()
            ctx.restore()

            let positions: Map<number, Vector> = new Map()

            for (let [node, object] of this.nodesObjects) {
                positions.set(node, this.positionGetter(object))
            }

            ctx.strokeStyle = 'blue'
            ctx.lineWidth = .1
            for (let nodeA of this.links) {

                for (let nodeB of nodeA[1]) {

                    let p1 = positions.get(nodeA[0])
                    let p2 = positions.get(nodeB)

                    ctx.beginPath()
                    ctx.moveTo(p1.x, p1.y)
                    ctx.lineTo(p2.x, p2.y)
                    ctx.stroke()

                }

            }


        }

        return true

    }

}

export class Node {

    cost: number = 0
    heuristic: number = 0
    previous: Node = null
    id: number

    constructor(id: number) { this.id = id }

}

export class Path {

    points: Vector[] = []
    currentPosition: Vector = new Vector()
    currentSegment = 1

    constructor(vectors: Vector[]) {

        this.points = vectors
        this.currentPosition.copy(this.points[0])

    }

    length(): number {

        let length = 0

        for (let index = 0; index < this.points.length - 1; index++)
            length += this.points[index].distanceTo(this.points[index + 1])

        return length

    }

    reset() {
        this.currentPosition.copy(this.points[0])
        this.currentSegment = 0
    }

    end(): boolean { return this.points.length == this.currentSegment }

    follow(length: number): Vector {

        let next = this.points[this.currentSegment]
        let distance = this.currentPosition.distanceTo(next)

        while (distance <= length) {

            length -= distance
            this.currentPosition.copy(next)
            next = this.points[++this.currentSegment]
            distance = this.currentPosition.distanceTo(next)
            if (this.currentSegment == this.points.length)
                return this.currentPosition.clone()

        }

        this.currentPosition.add(next.clone().sub(this.currentPosition).normalize().multS(length))

        return this.currentPosition.clone()

    }

}

export class PseudoRandom {

    static a: number = 1664525
    static c: number = 1013904223
    static m: number = Math.pow(2, 32)

    seed: number
    a: number = PseudoRandom.a
    c: number = PseudoRandom.c
    m: number = PseudoRandom.m

    constructor(seed: number = Math.random()) {

        this.seed = seed

    }

    get() {

        this.seed = (this.a * this.seed + this.c) % this.m
        return this.seed / this.m

    }

    static get(seed: number = Math.random()) {

        return ((PseudoRandom.a * seed + PseudoRandom.c) % PseudoRandom.m) / PseudoRandom.m

    }

}

export class PerlinNoise {

    rng: PseudoRandom
    seed: number
    grid: Vector[][][]
    horizontalLoop: number
    verticalLoop: number
    depthLoop: number

    constructor(seed: number = Math.random(), horizontalLoop: number = 2048, verticalLoop: number = 2048, depthLoop: number = 2048) {

        this.seed = seed
        this.horizontalLoop = horizontalLoop
        this.verticalLoop = verticalLoop
        this.depthLoop = depthLoop

        this.rng = new PseudoRandom(seed)

        this.grid = []

        for (let x of range(horizontalLoop)) {
            this.grid.push([])
            for (let y of range(verticalLoop)) {
                this.grid[x].push([])
                for (let z of range(depthLoop)) {

                    // let r = this.rng.get() * Math.PI * 2
                    let s = this.seed ^ x ^ (y * 57) ^ (z * 29)

                    let xv = Math.cos(s)
                    let yv = Math.sin(s)
                    let zv = PseudoRandom.get(s) * 2 - 1

                    let vec = new Vector(xv, yv, zv)

                    this.grid[x][y].push(vec)
                }

            }

        }

    }

    fade(t: number) {

        return t * t * t * (t * (t * 6 - 15) + 10)

    }

    getVector(ix: number, iy: number, iz: number): Vector {

        ix = ((ix % this.horizontalLoop) + this.horizontalLoop) % this.horizontalLoop
        iy = ((iy % this.verticalLoop) + this.verticalLoop) % this.verticalLoop
        iz = ((iz % this.depthLoop) + this.depthLoop) % this.depthLoop

        let vec = this.grid[ix][iy][iz]

        return vec

    }

    gradDotProduct(ix: number, iy: number, iz: number, x: number, y: number, z: number): number {

        let distanceVector = new Vector(x - ix, y - iy, z - iz)
        let grad = this.getVector(ix, iy, iz)

        let product = distanceVector.dot(grad)

        return product

    }

    get(x: number, y: number, z: number = 0): number {

        let x0 = Math.floor(x)
        let x1 = x0 + 1
        let y0 = Math.floor(y)
        let y1 = y0 + 1
        let z0 = Math.floor(z)
        let z1 = z0 + 1

        let sx = this.fade(x - x0)
        let sy = this.fade(y - y0)
        let sz = this.fade(z - z0)


        let n0: number, n1: number, lpy0: number, lpy1: number, lpz0: number, lpz1: number, value: number

        n0 = this.gradDotProduct(x0, y0, z0, x, y, z)
        n1 = this.gradDotProduct(x1, y0, z0, x, y, z)
        lpy0 = lerp(n0, n1, sx)
        n0 = this.gradDotProduct(x0, y1, z0, x, y, z)
        n1 = this.gradDotProduct(x1, y1, z0, x, y, z)
        lpy1 = lerp(n0, n1, sx)
        lpz0 = lerp(lpy0, lpy1, sy)

        n0 = this.gradDotProduct(x0, y0, z1, x, y, z)
        n1 = this.gradDotProduct(x1, y0, z1, x, y, z)
        lpy0 = lerp(n0, n1, sx)
        n0 = this.gradDotProduct(x0, y1, z1, x, y, z)
        n1 = this.gradDotProduct(x1, y1, z1, x, y, z)
        lpy1 = lerp(n0, n1, sx)
        lpz1 = lerp(lpy0, lpy1, sy)

        value = lerp(lpz0, lpz1, sz)

        return value

    }

}

export function lerp(a: number, b: number, t: number): number { return (1 - t) * a + t * b }

export function coserp(a: number, b: number, t: number): number {

    let t2 = (1 - Math.cos(t * Math.PI)) / 2

    return (1 - t2) * a + t2 * b

}

export function map(nbr: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number) {

    let t = (nbr - sourceMin) / (sourceMax - sourceMin)
    let res = t * (targetMax - targetMin) + targetMin

    return res
}