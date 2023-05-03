import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
import { Segment } from "./Segment.js";
import 'clipper-lib';
declare global {
    interface Window {
        ClipperLib: {
            Clipper: new () => Clipper;
            PolyType: {
                ptSubject: 0;
                ptClip: 1;
            };
            ClipType: {
                ctIntersection: 0;
                ctUnion: 1;
                ctDifference: 2;
                ctXor: 3;
            };
            PolyFillType: {
                pftEvenOdd: 0;
                pftNonZero: 1;
                pftPositive: 2;
                pftNegative: 3;
            };
        };
    }
}
export type Clipper = {
    AddPaths: (paths: clipperpaths, polytype: polytype, closed: boolean) => void;
    Execute: (cliptype: cliptype, solution: clipperpaths, subjFillType: polyfilltype, clipFillType: polyfilltype) => void;
};
export type cliptype = number;
export type polytype = number;
export type polyfilltype = number;
export type clipperpoint = {
    X: number;
    Y: number;
};
export type clipperpath = clipperpoint[];
export type clipperpaths = clipperpath[];
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
    get clipperpaths(): clipperpaths;
    static clip(sourcePaths: clipperpaths, clippingPaths: clipperpaths, clipType: cliptype, subjectPolyFillType?: polyfilltype, clipperPolyFillType?: polyfilltype): clipperpaths;
    static union(source: clipperpaths, clipper: clipperpaths): clipperpaths;
    static intersect(source: clipperpaths, clipper: clipperpaths): clipperpaths;
    static difference(source: clipperpaths, clipper: clipperpaths): clipperpaths;
    static deFloat(paths: clipperpaths, precision?: number): clipperpaths;
    static inFloat(paths: clipperpaths, precision?: number): clipperpaths;
    static pathClipperPaths(ctx: CanvasRenderingContext2D, clipperpaths: clipperpaths): void;
}
