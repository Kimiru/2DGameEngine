import { matrix } from "./TransformMatrix.js";
import { Vector } from "./Vector.js";
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
