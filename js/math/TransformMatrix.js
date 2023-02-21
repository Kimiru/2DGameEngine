import { Vector } from "./Vector.js";
export class TransformMatrix {
    static default() { return [1, 0, 0, 1, 0, 0]; }
    static multMat(m1, m2) {
        return [
            m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
        ];
    }
    /**
     * Multiply the given matrix by the given Vector. Mutation safe
     *
     * @param m1
     * @param vec
     * @returns
     */
    static multVec(m1, vec) {
        return new Vector(m1[0] * vec.x + m1[2] * vec.y + m1[4], m1[1] * vec.x + m1[3] * vec.y + m1[5], 0);
    }
}
