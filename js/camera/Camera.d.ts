import { Rectangle } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { matrix } from "../math/TransformMatrix.js";
/**
 * The Camera class is used to set the center of the view inside a scene
 */
export declare class Camera extends GameObject {
    /**
     * Create a new Camera object
     */
    constructor();
    get viewRect(): Rectangle;
    getViewTransformMatrix(): matrix;
    getRange(): number;
}
