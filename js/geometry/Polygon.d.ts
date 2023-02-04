import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
import { Segment } from "./Segment.js";
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
    transferInnersToOuter(): void;
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
    static GreinerHormann(subject: Polygon, clipper: Polygon, subjectForward: boolean, clipperForward: boolean): Polygon[];
}
