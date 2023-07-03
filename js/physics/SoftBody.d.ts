import { GameObject, Vector } from "../2DGameEngine.js";
export declare namespace SoftBody {
    class Solver extends GameObject {
        constraints: Constraint[];
        addConstraint(...constraints: Constraint[]): void;
        removeConstraint(...constraints: Constraint[]): void;
        integrableBodies: IntegrableBody[];
        addIntegrableBody(...integrableBodies: IntegrableBody[]): void;
        removeIntegrableBody(...integrableBodies: IntegrableBody[]): void;
        collidableBodies: CollidableBody[];
        addCollidableBody(...collidableBodies: CollidableBody[]): void;
        removeCollidableBody(...collidableBodies: CollidableBody[]): void;
        physics(dt: number): void;
    }
    interface IntegrableBody {
        integrate: (dt: number) => void;
        getPoints(): Point[];
    }
    interface CollidableBody {
        containsPoint(point: Point): boolean;
        closestEdgeOfPoint(point: Point): [Point, Point, number];
    }
    class Point implements IntegrableBody {
        position: Vector;
        velocity: Vector;
        acceleration: Vector;
        freeze: boolean;
        constructor(position?: Vector, velocity?: Vector, acceleration?: Vector, freeze?: boolean);
        getPoints(): Point[];
        integrate(dt: number): void;
    }
    class Shape extends GameObject implements IntegrableBody, CollidableBody {
        points: Point[];
        constructor(points: Point[]);
        getPoints(): Point[];
        integrate(dt: any): void;
        containsPoint(point: Point): boolean;
        distancePointToEdge(point: Vector, [A, B]: [Vector, Vector]): number;
        closestEdgeOfPoint(point: Point): [Point, Point, number];
    }
    interface Constraint {
        applyConstraint: () => void;
    }
    class Spring {
        static stiffness: number;
        static damping: number;
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