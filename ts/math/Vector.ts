import { lerp } from "./Utils.js"

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
     * Return a new Vector, Sum of this vector and the given vector
     * 
     * @param {Vector} vector 
     * @returns {Vector}
     */
    add(vector: Vector): Vector {

        return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z)

    }

    /**
     * Return a new Vector, Sum of this vector and the given numbers
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z
     * @returns {Vector}
     */
    addS(x: number = 0, y: number = 0, z: number = 0): Vector {

        return new Vector(this.x + x, this.y + y, this.z + z)

    }

    /**
     * Return a new Vector, Sub of this vector by the given vector
     * 
     * @param {Vector} vector 
     * @returns {Vector}
     */
    sub(vector: Vector): Vector {

        return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z)

    }

    /**
    * Return a new Vector, Sub of this vector by the given numbers
    * 
    * @param {number} x 
    * @param {number} y 
    * @param {number} z
    * @returns {Vector}
    */
    subS(x: number = 0, y: number = 0, z: number = 0): Vector {

        return new Vector(this.x - x, this.y - y, this.z - z)


    }

    /**
     * Return a new Vector, Mult of this vector by each member of the given vector
     * 
     * @param {Vector} vector 
     * @returns {Vector}
     */
    mult(vector: Vector): Vector {

        return new Vector(this.x * vector.x, this.y * vector.y, this.z * vector.z)


    }

    /**
     * Return a new Vector, Mult of this vector by a given number
     * 
     * @param {number} n 
     * @returns {Vector}
     */
    multS(n: number): Vector {

        return new Vector(this.x * n, this.y * n, this.z * n)


    }

    /**
    * Return a new Vector, Div of this vector by each member of the given vector
    * 
    * @param {Vector} vector 
    * @returns {Vector}
    */
    div(vector: Vector): Vector {

        return new Vector(this.x / vector.x, this.y / vector.y, this.z / vector.z)

    }

    /**
     * Return a new Vector, Div of this vector by a given number
     * 
     * @param {number} n 
     * @returns {Vector} 
     */
    divS(n: number): Vector {

        return new Vector(this.x / n, this.y / n, this.z / n)

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

    normSquared(): number { return this.x * this.x + this.y * this.y + this.z * this.z }

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
    normalizeSelf(): this {

        if (!this.nil())
            this.divS(this.length())

        return this

    }

    /**
     * Return a new vector, Normalization of this vector
     * 
     * @returns {Vector}
     */
    normalised(): Vector {
        return this.clone().normalizeSelf()
    }

    /**
     * Rotates the current vector of a given angle on the x and y values
     * 
     * @param {number} angle 
     * @returns {this}
     */
    rotateSelf(angle: number): this {

        let cos = Math.cos(angle)
        let sin = Math.sin(angle)

        let x = cos * this.x - sin * this.y
        let y = sin * this.x + cos * this.y

        this.x = x
        this.y = y

        return this

    }

    /**
     * Return a new vector, rotation of this vector
     * 
     * @param angle 
     */
    rotated(angle: number): Vector {
        return this.clone().rotateSelf(angle)
    }

    /**
     * Rotate the current vector of a given angle arround a given position on the x and y values
     * 
     * @param {Vector} position 
     * @param {number} angle 
     * @returns {this}
     */
    rotateAroundSelf(position: Vector, angle: number): this {

        this.sub(position)
        this.rotateSelf(angle)
        this.add(position)

        return this

    }

    /**
     * Return a vector, rotation of this vector around a given position
     * 
     * @param {Vector} position
     * @param {number} angle 
     * @returns {Vector}
     */
    rotateAround(position: Vector, angle: number): Vector {
        return this.clone().rotateAroundSelf(position, angle)
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

        let vec = this.clone().normalizeSelf()
        return Math.acos(vec.x) * (Math.sign(vec.y) || 1)

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

    roundSelf(n: number = 1): this {

        this.x = Math.round(this.x / n) * n
        this.y = Math.round(this.y / n) * n
        this.z = Math.round(this.z / n) * n

        return this

    }

    round(n: number = 1): Vector {
        return this.clone().roundSelf()
    }

    floorSelf(n: number = 1): this {

        this.x = Math.floor(this.x / n) * n
        this.y = Math.floor(this.y / n) * n
        this.z = Math.floor(this.z / n) * n

        return this

    }

    floor(n: number = 1): Vector {
        return this.clone().floorSelf(n)
    }


    ceilSelf(n: number = 1): this {

        this.x = Math.ceil(this.x / n) * n
        this.y = Math.ceil(this.y / n) * n
        this.z = Math.ceil(this.z / n) * n

        return this

    }

    ceil(n: number): Vector {
        return this.clone().ceilSelf(n)
    }

    absSelf() {

        this.x = Math.abs(this.x)
        this.y = Math.abs(this.y)
        this.z = Math.abs(this.z)

        return this

    }

    abs() {
        return this.clone().absSelf()
    }

    projectOn(vector: Vector): Vector {

        let dot = this.dot(vector)
        let normSquared = vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
        let scalar = dot / normSquared

        return vector.multS(scalar)

    }

    normal() {

        return new Vector(-this.y, this.x)

    }

    to(vector: Vector): Vector {

        return vector.sub(this)

    }

    arrayXY(): [number, number] { return [this.x, this.y] }

    arrayXYZ(): [number, number, number] { return [this.x, this.y, this.z] }

    neighbors(_8: boolean = false): Vector[] {
        return (_8 ? this.units8() : this.units()).map((vector: Vector) => vector.add(this))
    }

    lerp(v: Vector, t: number) {
        return new Vector(lerp(this.x, v.x, t), lerp(this.y, v.y, t))
    }

    units(): Vector[] { return Vector.units() }

    static units(): Vector[] {

        return [

            new Vector(1, 0),
            new Vector(-1, 0),
            new Vector(0, 1),
            new Vector(0, -1)

        ]

    }

    units8(): Vector[] { return Vector.units8() }

    static units8(): Vector[] {

        return [
            ...this.units(),
            new Vector(1, 1),
            new Vector(-1, -1),
            new Vector(1, -1),
            new Vector(-1, 1)
        ]

    }

}