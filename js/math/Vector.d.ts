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
     * Return a new Vector, Sum of this vector and the given vector
     *
     * @param {Vector} vector
     * @returns {Vector}
     */
    add(vector: Vector): Vector;
    /**
     * Return a new Vector, Sum of this vector and the given numbers
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Vector}
     */
    addS(x?: number, y?: number, z?: number): Vector;
    /**
     * Return a new Vector, Sub of this vector by the given vector
     *
     * @param {Vector} vector
     * @returns {Vector}
     */
    sub(vector: Vector): Vector;
    /**
    * Return a new Vector, Sub of this vector by the given numbers
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {Vector}
    */
    subS(x?: number, y?: number, z?: number): Vector;
    /**
     * Return a new Vector, Mult of this vector by each member of the given vector
     *
     * @param {Vector} vector
     * @returns {Vector}
     */
    mult(vector: Vector): Vector;
    /**
     * Return a new Vector, Mult of this vector by a given number
     *
     * @param {number} n
     * @returns {Vector}
     */
    multS(n: number): Vector;
    /**
    * Return a new Vector, Div of this vector by each member of the given vector
    *
    * @param {Vector} vector
    * @returns {Vector}
    */
    div(vector: Vector): Vector;
    /**
     * Return a new Vector, Div of this vector by a given number
     *
     * @param {number} n
     * @returns {Vector}
     */
    divS(n: number): Vector;
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
    normSquared(): number;
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
    normalizeSelf(): this;
    /**
     * Return a new vector, Normalization of this vector
     *
     * @returns {Vector}
     */
    normalised(): Vector;
    /**
     * Rotates the current vector of a given angle on the x and y values
     *
     * @param {number} angle
     * @returns {this}
     */
    rotateSelf(angle: number): this;
    /**
     * Return a new vector, rotation of this vector
     *
     * @param angle
     */
    rotated(angle: number): Vector;
    /**
     * Rotate the current vector of a given angle arround a given position on the x and y values
     *
     * @param {Vector} position
     * @param {number} angle
     * @returns {this}
     */
    rotateAroundSelf(position: Vector, angle: number): this;
    /**
     * Return a vector, rotation of this vector around a given position
     *
     * @param {Vector} position
     * @param {number} angle
     * @returns {Vector}
     */
    rotateAround(position: Vector, angle: number): Vector;
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
    roundSelf(n?: number): this;
    round(n?: number): Vector;
    floorSelf(n?: number): this;
    floor(n?: number): Vector;
    ceilSelf(n?: number): this;
    ceil(n: number): Vector;
    absSelf(): this;
    abs(): Vector;
    projectOn(vector: Vector): Vector;
    normal(): Vector;
    to(vector: Vector): Vector;
    arrayXY(): [number, number];
    arrayXYZ(): [number, number, number];
    neighbors(_8?: boolean): Vector[];
    lerp(v: Vector, t: number): Vector;
    units(): Vector[];
    static units(): Vector[];
    units8(): Vector[];
    static units8(): Vector[];
}
