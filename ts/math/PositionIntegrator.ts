import { Vector } from "./Vector.js"

export class PositionIntegrator {

    previousPosition: Vector = new Vector()
    previousVelocity: Vector = new Vector()
    previousAcceleration: Vector = new Vector()
    position: Vector = new Vector()
    velocity: Vector = new Vector()
    acceleration: Vector = new Vector()

    constructor() { }

    integrate(t: number) {

        let tt = t * t

        this.previousPosition.copy(this.position)
        this.previousVelocity.copy(this.velocity)
        this.previousAcceleration.copy(this.acceleration)

        this.position
            .addSelf(this.velocity.multS(t))
            .addSelf(this.acceleration.multS(tt * .5))

        this.velocity.addSelf(this.acceleration.multS(t))

    }

    positionHasChanged() { return !this.previousPosition.equal(this.position) }

    velocityHasChanged() { return !this.previousVelocity.equal(this.velocity) }

    accelerationHasChanged() { return !this.previousAcceleration.equal(this.acceleration) }

}