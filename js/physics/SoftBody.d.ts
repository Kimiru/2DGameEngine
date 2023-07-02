import { GameObject, Vector } from "../2DGameEngine.js";
export declare namespace SoftBody {
    class Solver extends GameObject {
        integrableBodies: IntegrableBody[];
        constraints: Constraint[];
        addIntegrableBody(...integrableBodies: IntegrableBody[]): void;
        removeIntegrableBody(...integrableBodies: IntegrableBody[]): void;
        addConstraint(...constraints: Constraint[]): void;
        removeConstraint(...constraints: Constraint[]): void;
        physics(dt: number): void;
    }
    interface IntegrableBody {
        integrate: (dt: number) => void;
    }
    class Point implements IntegrableBody {
        position: Vector;
        velocity: Vector;
        acceleration: Vector;
        freeze: boolean;
        constructor(position?: Vector, velocity?: Vector, acceleration?: Vector, freeze?: boolean);
        integrate(dt: number): void;
    }
    class Shape extends GameObject implements IntegrableBody {
        points: Point[];
        constructor(points: Point[]);
        integrate(dt: any): void;
    }
    interface Constraint {
        applyConstraint: () => void;
    }
    class Spring {
        point_0: Point;
        point_1: Point;
        stiffness: number;
        damping: number;
        restLength: number;
        constructor(point_0: Point, point_1: Point, stiffness?: number, damping?: number, restLength?: number);
        relaxSpring(): void;
        applyConstraint(): void;
    }
}
