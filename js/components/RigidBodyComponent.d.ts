import { GameComponent, Polygon, Vector } from "../2DGameEngine.js";
export declare class RigitBodyComponent extends GameComponent {
    unique: boolean;
    velocity: Vector;
    acceleration: Vector;
    momentsOfInertia: number[];
    momentOfInertia: number;
    angularVelocity: number;
    angularAcceleration: number;
    polygon: Polygon;
    mass: number;
    constructor(polygon: Polygon, weight: number);
    updatePolygon(polygon: Polygon, weight: number): void;
    physics(dt: number): void;
    applyForce(position: Vector, force: Vector): void;
}
