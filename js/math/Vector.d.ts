/**
 * class Vector represent a 3 dimentional vector
 * it also contains function that are used in 2d context for practical purposes
 */
export declare class Vector {
    x: number;
    y: number;
    z: number;
    /**
     * Create a new 3D Vector
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x?: number, y?: number, z?: number);
    /**
    * Set this vector values to the given values
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {this}
    */
    set(x?: number, y?: number, z?: number): this;
    /**
     * Add the given vector to this vector
     *
     * @param {Vector} vector
     * @returns {this}
     */
    add(vector?: Vector): this;
    /**
     * Add the given numbers to this vector
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {this}
     */
    addS(x?: number, y?: number, z?: number): this;
    /**
     * Sub the given vector to this vector
     *
     * @param {Vector} vector
     * @returns {this}
     */
    sub(vector?: Vector): this;
    /**
    * Sub the given numbers to this vector
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {this}
    */
    subS(x?: number, y?: number, z?: number): this;
    /**
     * Multiply each of this vector value by each of the given vector value
     *
     * @param {Vector} vector
     * @returns {this}
     */
    mult(vector: Vector): this;
    /**
     * Multiply this vector by a given value
     *
     * @param {number} n
     * @returns {this}
     */
    multS(n: number): this;
    /**
    * Divide each of this vector value by each of the given vector value
    *
    * @param {Vector} vector
    * @returns {this}
    */
    div(vector: Vector): this;
    /**
     * Divide this vector by a given value
     *
     * @param {number} n
     * @returns {this}
     */
    divS(n: number): this;
    /**
     * Returns the result of the dot product between this vector and the given vector
     *
     * @param {Vector} vector
     * @returns {number}
     */
    dot(vector: Vector): number;
    /**
     * Returns the length of this vector
     *
     * @returns {number}
     */
    length(): number;
    /**
     * Returns true if the length of this vector is 0
     *
     * @returns {boolean}
     */
    nil(): boolean;
    /**
     * Normalizes this vector if it is not nil
     *
     * @returns {this}
     */
    normalize(): this;
    /**
     * Rotates the current vector of a given angle on the x and y values
     *
     * @param {number} angle
     * @returns {this}
     */
    rotate(angle: number): this;
    /**
     * Rotate the current vector of a given angle arround a given position on the x and y values
     *
     * @param {Vector} position
     * @param {number} angle
     * @returns {this}
     */
    rotateAround(position: Vector, angle: number): this;
    /**
     * Returns the angle between this vector and the given vector
     *
     * @param vector
     * @returns {number}
     */
    angleTo(vector: Vector): number;
    /**
     * Returns the angle on this vector on plane x, y
     *
     * @returns {number}
     */
    angle(): number;
    /**
     * Returns the distance from this Vector position to the given Vector position
     *
     * @param {Vector} vector
     * @returns {number}
     */
    distanceTo(vector: Vector): number;
    /**
     * Copy the given vector values to this vector
     *
     * @param {Vector} vector
     */
    copy(vector: Vector): this;
    /**
     * A new instance clone of this vector
     *
     * @returns {Vector}
     */
    clone(): Vector;
    /**
     * Returns true if this vector values are equal to the given vector values
     *
     * @param {Vector} vector
     * @returns {boolean}
     */
    equal(vector: Vector): boolean;
    /**
     * Returns true if this vector values are equal to the given values
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    equalS(x?: number, y?: number, z?: number): boolean;
    /**
     * Converts this vector to a string
     *
     * @returns {string}
     */
    toString(): string;
    /**
     * Returns a new unit vector from the given angle
     *
     * @param {number} angle
     * @returns {Vector}
     */
    static fromAngle(angle: number): Vector;
    static distanceBetween(a: Vector, b: Vector): number;
    exec(func: (vec: Vector) => void): this;
    round(n?: number): this;
    floor(n?: number): this;
    ceil(n?: number): this;
    abs(): this;
    arrayXY(): [number, number];
    arrayXYZ(): [number, number, number];
    neighbors(_8?: boolean): Vector[];
    units(): Vector[];
    static units(): Vector[];
    units8(): Vector[];
    static units8(): Vector[];
}
