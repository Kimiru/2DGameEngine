import { GameObject, Vector } from "../2DGameEngine.js";
export declare namespace SoftBody {
    class Solver extends GameObject {
        springs: Spring[];
        shapes: Shape[];
        addSpring(...springs: Spring[]): void;
        removeSpring(...springs: Spring[]): void;
        addShape(...shapes: Shape[]): void;
        removeShape(...shapes: Shape[]): void;
        physics(dt: number): void;
    }
    class Point {
        position: Vector;
        velocity: Vector;
        acceleration: Vector;
        freeze: boolean;
        constructor(position?: Vector, velocity?: Vector, acceleration?: Vector, freeze?: boolean);
        integrate(dt: number): void;
    }
    class Shape extends GameObject {
        points: Point[];
        constructor(points: Point[]);
        integratePoints(dt: any): void;
    }
    class Spring {
        point_0: Point;
        point_1: Point;
        strength: number;
        restLength: number;
        constructor(point_0: Point, point_1: Point, strength: number, restLength?: number);
        relaxSpring(): void;
        applyConstraint(): void;
    }
}
