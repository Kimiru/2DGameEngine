import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
import { Segment } from "./Segment.js";
import '../../node_modules/polybooljs/dist/polybool.js';
declare global {
    interface Window {
        PolyBool: {
            union: polybooloperation;
            intersect: polybooloperation;
            difference: polybooloperation;
            differenceRev: polybooloperation;
            xor: polybooloperation;
            epsilon: (number: any) => number;
        };
    }
}
export type polypoint = [number, number];
export type polyregion = polypoint[];
export type polybool = {
    regions: polyregion[];
    inverted: boolean;
};
export type polybooloperation = (p0: polybool, p1: polybool) => polybool;
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
    path(ctx: CanvasRenderingContext2D): void;
    containsVector(vector: Vector): boolean;
    containsWorldVector(vector: Vector): boolean;
    get polybool(): polybool;
    set polybool(polybool: polybool);
    static polygonToPolybool(polygons: Polygon[]): polybool;
    static polyboolToPolygons(polybool: polybool): Polygon[];
    static getDefaultPolybool(): polybool;
    static union(source: Polygon[], clipper: Polygon[]): Polygon[];
    static intersect(source: Polygon[], clipper: Polygon[]): Polygon[];
    static difference(source: Polygon[], clipper: Polygon[]): Polygon[];
    static differenceRev(source: Polygon[], clipper: Polygon[]): Polygon[];
    static xor(source: Polygon[], clipper: Polygon[]): Polygon[];
    static polyboolPath(ctx: CanvasRenderingContext2D, polybool: polybool): void;
}
