export type matrix = [number, number, number, number, number, number];
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
    /**
     *
     * @returns {this}
     */
    round(): this;
    /**
     *
     * @returns {this}
     */
    floor(): this;
    abs(): this;
}
export declare class HexOrientation {
    static flat: number;
    static pointy: number;
}
export declare class HexVector {
    #private;
    orientation: number;
    vector: Vector;
    unit: number;
    constructor(orientation?: number, unit?: number, vector?: Vector, q?: number, r?: number, s?: number);
    get q(): number;
    get r(): number;
    get s(): number;
    addS(q: number, r: number, s: number): this;
    add(hexVector: HexVector): this;
    distanceTo(hexVector: HexVector): number;
    equal(hexVector: HexVector): boolean;
    equalS(q: number, r: number, s: number): boolean;
    neighbors(): HexVector[];
    units(): HexVector[];
    static units(orientation: number, unit: number): HexVector[];
}
export declare class Transform {
    #private;
    translation: Vector;
    scale: Vector;
    constructor(translation?: Vector, rotation?: number, scale?: Vector);
    /**
    * Return the rotation of the object
    *
    * @returns {number}
    */
    get rotation(): number;
    /**
     * Set the rotation of the object
     * The angle is automatically converted into modulo 2.PI > 0
     *
     * @param {number} angle
     */
    set rotation(angle: number);
    clear(): void;
    isDefault(): boolean;
    getMatrix(): matrix;
    getInvertMatrix(): matrix;
    toString(): string;
}
export declare class PositionIntegrator {
    previousPosition: Vector;
    previousVelocity: Vector;
    previousAcceleration: Vector;
    position: Vector;
    velocity: Vector;
    acceleration: Vector;
    constructor();
    integrate(t: number): void;
    positionHasChanged(): boolean;
    velocityHasChanged(): boolean;
    accelerationHasChanged(): boolean;
}
export declare class TransformMatrix {
    static multMat(m1: matrix, m2: matrix): matrix;
    /**
     * Multiply the given matrix by the given Vector. Mutation safe
     *
     * @param m1
     * @param vec
     * @returns
     */
    static multVec(m1: matrix, vec: Vector): Vector;
}
export declare class Graph<T> {
    nodes: Set<number>;
    nodesObjects: Map<number, T>;
    links: Map<number, Set<number>>;
    display: boolean;
    positionGetter: (object: T) => Vector;
    constructor(display?: boolean, positionGetter?: (object: T) => Vector);
    /**
     *
     * @param {...number} nodes
     */
    addNode(...nodes: [number, T][]): void;
    /**
     *
     * @param {...number} nodes
     */
    removeNode(...nodes: number[]): void;
    /**
     *
     * @param {number} node
     * @returns {boolean}
     */
    hasNode(node: number): boolean;
    /**
     *
     * @param {...{source:number, target:number, data:any}} links
     */
    addLink(...links: {
        source: number;
        target: number;
    }[]): void;
    /**
     *
     * @param {...{source:number, target:number}} links
     */
    removeLink(...links: {
        source: number;
        target: number;
    }[]): void;
    hasLink(source: number, target: number): boolean;
    isConnectedTo(source: number, target: number): boolean;
    isConnected(node: number): boolean;
    isFullyConnected(): boolean;
    getShortestPathBetween(source: number, target: number, estimateDistance: (nodeA: T, nodeB: T) => number): number[];
    draw(ctx: CanvasRenderingContext2D): boolean;
}
export declare class Node {
    cost: number;
    heuristic: number;
    previous: Node;
    id: number;
    constructor(id: number);
}
export declare class Path {
    points: Vector[];
    currentPosition: Vector;
    currentSegment: number;
    constructor(vectors: Vector[]);
    length(): number;
    reset(): void;
    end(): boolean;
    follow(length: number): Vector;
}
export declare class PseudoRandom {
    static a: number;
    static c: number;
    static m: number;
    seed: number;
    a: number;
    c: number;
    m: number;
    constructor(seed?: number);
    get(): number;
    static get(seed?: number): number;
}
export declare class PerlinNoise {
    rng: PseudoRandom;
    seed: number;
    grid: Vector[][][];
    horizontalLoop: number;
    verticalLoop: number;
    depthLoop: number;
    constructor(seed?: number, horizontalLoop?: number, verticalLoop?: number, depthLoop?: number);
    fade(t: number): number;
    getVector(ix: number, iy: number, iz: number): Vector;
    gradDotProduct(ix: number, iy: number, iz: number, x: number, y: number, z: number): number;
    get(x: number, y: number, z?: number): number;
}
export declare function lerp(a: number, b: number, t: number): number;
export declare function coserp(a: number, b: number, t: number): number;
export declare function map(nbr: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number): number;
