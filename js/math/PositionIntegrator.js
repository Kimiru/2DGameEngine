import { Vector } from "./Vector.js";
export class PositionIntegrator {
    previousPosition = new Vector();
    previousVelocity = new Vector();
    previousAcceleration = new Vector();
    position = new Vector();
    velocity = new Vector();
    acceleration = new Vector();
    constructor() { }
    integrate(t) {
        let tt = t * t;
        this.previousPosition.copy(this.position);
        this.previousVelocity.copy(this.velocity);
        this.previousAcceleration.copy(this.acceleration);
        this.position
            .add(this.velocity.multS(t))
            .add(this.acceleration.multS(tt * .5));
        this.velocity.add(this.acceleration.multS(t));
    }
    positionHasChanged() { return !this.previousPosition.equal(this.position); }
    velocityHasChanged() { return !this.previousVelocity.equal(this.velocity); }
    accelerationHasChanged() { return !this.previousAcceleration.equal(this.acceleration); }
}
