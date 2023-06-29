import { matrix } from "./TransformMatrix.js"
import { Vector } from "./Vector.js"

const PI2 = Math.PI * 2

export class Transform {

    translation: Vector = new Vector()
    #rotation: number = 0
    scale: Vector = new Vector()

    constructor(translation: Vector = new Vector(0, 0, 0), rotation: number = 0, scale: Vector = new Vector(1, 1, 1)) {

        this.translation.copy(translation)
        this.rotation = rotation
        this.scale.copy(scale)

    }

    /**
    * Return the rotation of the object
    * 
    * @returns {number}
    */
    get rotation() { return this.#rotation }

    /**
     * Set the rotation of the object
     * The angle is automatically converted into modulo 2.PI > 0
     * 
     * @param {number} angle
     */
    set rotation(angle: number) {

        this.#rotation = ((angle % PI2) + PI2) % PI2

    }

    clear() {

        this.translation.set(0, 0, 0)
        this.rotation = 0
        this.scale.set(1, 1, 1)

    }

    isDefault(): boolean {

        return this.translation.x === 0 && this.translation.y === 0 &&
            this.#rotation == 0 &&
            this.scale.x === 1 && this.scale.y === 1

    }

    getMatrix(): matrix {

        let cos = Math.cos(this.#rotation)
        let sin = Math.sin(this.#rotation)
        let sx = this.scale.x
        let sy = this.scale.y
        let x = this.translation.x
        let y = this.translation.y

        return [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ]

    }

    getInvertMatrix(): matrix {

        let cos = Math.cos(this.#rotation)
        let sin = Math.sin(this.#rotation)
        let sx = this.scale.x
        let sy = this.scale.y
        let x = (-this.translation.x * cos + -this.translation.y * sin) / sx
        let y = (this.translation.x * sin + -this.translation.y * cos) / sy

        return [
            cos / sx,
            -sin / sy,
            sin / sx,
            cos / sy,
            x,
            y
        ]

    }

    toString() {

        let str = 'Transform( '

        if (this.translation.x !== 0 || this.translation.y !== 0) str += this.translation.toString() + ' '
        if (this.rotation !== 0) str += this.rotation + ' '
        if (this.scale.x !== 1 || this.scale.y !== 1) str += this.scale.toString() + ' '

        str += ')'

        return str

    }

}