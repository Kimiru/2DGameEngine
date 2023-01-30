import { GameObject } from "./2DGameEngine.js";
import { HexagonGraphInterface, HexOrientation, HexVector, Vector } from "./2DGEMath.js";
/**
 * The Polygon represent a N point polygon
 * To work properly, it needs at least 3 point to close
 */
export declare class Polygon extends GameObject {
    #private;
    outer: Vector[];
    inners: Vector[][];
    fill: boolean;
    /**
     * Create a new polygon using the given points
     *
     * @param points
     */
    constructor(outer?: Vector[], ...inners: Vector[][]);
    static isClockwise(vectors: Vector[]): boolean;
    getOuter(index: number): Vector;
    hasInners(): boolean;
    popInners(): Polygon[];
    clone(): Polygon;
    /**
     * Returns a list of points, such that it represents the polygon with theorically no holes. Duplicates the first Vector at the end of the list for practical purposes
     *
     * @returns {Vector[]}
     */
    getLinear(): Vector[];
    getWorldLinear(): Vector[];
    /**
     * Get the list of segments between the points in order
     * Returns an empty list if there is only one point
     *
     * @returns {Segment[]}
     */
    getSegments(): Segment[];
    getWorldSegment(): Segment[];
    /**
     * Draw the polygon
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx: CanvasRenderingContext2D): void;
    containsVector(vector: Vector): boolean;
    containsWorldVector(vector: Vector): boolean;
    static GreinerHormann(subject: Polygon, clipper: Polygon, subjectForward: boolean, clipperForward: boolean): Polygon[][];
}
/**
 *
 */
export declare class Rectangle extends Polygon {
    #private;
    display: boolean;
    displayColor: string;
    constructor(x?: number, y?: number, w?: number, h?: number, display?: boolean, displayColor?: string);
    getLinear(): Vector[];
    get x(): number;
    set x(n: number);
    get y(): number;
    set y(n: number);
    get w(): number;
    set w(n: number);
    get h(): number;
    set h(n: number);
    get halfW(): number;
    set halfW(n: number);
    get halfH(): number;
    set halfH(n: number);
    get left(): number;
    set left(n: number);
    get right(): number;
    set right(n: number);
    get bottom(): number;
    set bottom(n: number);
    get top(): number;
    set top(n: number);
    get topleft(): Vector;
    set topleft(v: Vector);
    get bottomleft(): Vector;
    set bottomleft(v: Vector);
    get topright(): Vector;
    set topright(v: Vector);
    get bottomright(): Vector;
    set bottomright(v: Vector);
    contains(vector: Vector): boolean;
    collide(rect: Rectangle): boolean;
    draw(ctx: CanvasRenderingContext2D): boolean;
    clone(): Rectangle;
    copy(rectangle: Rectangle): this;
    toString(): string;
}
export declare class Hexagon extends Polygon {
    unit: number;
    orientation: HexOrientation;
    display: boolean;
    color: string;
    constructor(position?: Vector, orientation?: HexOrientation, unit?: number);
    getLinear(): Vector[];
    static ctxPath(ctx: CanvasRenderingContext2D, orientation: HexOrientation, unit: number): void;
    ctxPath(ctx: any): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class GridHexagon extends Hexagon implements HexagonGraphInterface {
    hexVector: HexVector;
    constructor(hexVector?: HexVector);
    getLinear(): Vector[];
}
export declare class Segment extends GameObject {
    a: Vector;
    b: Vector;
    display: boolean;
    lineWidth: number;
    constructor(a: Vector, b: Vector, display?: boolean);
    intersect(segment: Segment): Vector;
    length(): number;
    draw(ctx: CanvasRenderingContext2D): boolean;
}
export declare class Ray extends GameObject {
    direction: Vector;
    constructor(position: Vector, direction: Vector);
    intersect(segment: Segment): Vector;
    cast(segments: Segment[]): Vector;
    draw(ctx: CanvasRenderingContext2D): boolean;
}
export declare class RayCastView {
    static compute(position: Vector, segments: Segment[], infinity?: number): Polygon;
    static cropPolygon(ctx: CanvasRenderingContext2D, polygon: Polygon): void;
}
