import { Rectangle } from "../2DGameEngine.js"
import { GameObject } from "../basics/GameObject.js"
import { Transform } from "../math/Transform.js"
import { matrix } from "../math/TransformMatrix.js"

/**
 * The Camera class is used to set the center of the view inside a scene
 */
export class Camera extends GameObject {

    /**
     * Create a new Camera object
     */
    constructor() {

        super()

        this.updateEnabled = false
        this.physicsEnabled = false
        this.drawEnabled = false

        this.zIndex = Number.MAX_SAFE_INTEGER

    }

    get viewRect(): Rectangle {

        return new Rectangle(
            this.position.x,
            this.position.y,

            this.engine.usableWidth * this.size.x,
            this.engine.usableHeight * this.size.y
        )

    }

    getViewTransformMatrix(): matrix {

        let wpos = this.getWorldPosition()
        let wrot = this.getWorldRotation()

        return new Transform(wpos, wrot, this.transform.scale).getInvertMatrix()

    }



    getRange(): number { return Math.max(this.transform.scale.x, this.transform.scale.y) }

}
