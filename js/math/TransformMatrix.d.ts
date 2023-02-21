import { Vector } from "./Vector.js";
export type matrix = [number, number, number, number, number, number];
export declare class TransformMatrix {
    static default(): matrix;
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
