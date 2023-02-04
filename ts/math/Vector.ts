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