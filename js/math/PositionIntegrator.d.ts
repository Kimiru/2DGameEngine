import { Vector } from "./Vector.js";
export declare class PositionIntegrator {
    previousPosition: Vector;
    previousVelocity: Vector;
    previousAcceleration: Vector;
    position: Vector;
    velocity: Vector;
    acceleration: Vector;
    constructor();
    integrate(t: number): void;
    positionHasChanged(): boolean;
    velocityHasChanged(): boolean;
    accelerationHasChanged(): boolean;
}
