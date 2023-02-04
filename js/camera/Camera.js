import { GameObject } from "../basics/GameObject.js";
import { Transform } from "../math/Transform.js";
/**
 * The Camera class is used to set the center of the view inside a scene
 */
export class Camera extends GameObject {
    /**
     * Create a new Camera object
     */
    constructor() {
        super();
        this.updateEnabled = false;
        this.physicsEnabled = false;
        this.drawEnabled = false;
    }
    getViewTransformMatrix() {
        let wpos = this.getWorldPosition();
        let wrot = this.getWorldRotation();
        return new Transform(wpos, wrot, this.transform.scale).getInvertMatrix();
    }
    getRange() { return Math.max(this.transform.scale.x, this.transform.scale.y); }
}
