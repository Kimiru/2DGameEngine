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
        resolveCollision(point: Point, collidableBody: CollidableBody): void;
        resolveEdgeCollision(P: Point, [A, B]: [Point, Point]): void;
        resolveEdgeCollisionPosition({ position: P }: Point, [{ position: A }, { position: B }]: [Point, Point]): void;
        resolveEdgeCollisionVelocity(P: Point, [A, B]: [Point, Point], absorpsion?: number, frixion?: number): void;
    }
    interface IntegrableBody {
        integrate: (dt: number) => void;
        getPoints(): Point[];
    }
    interface CollidableBody {
        containsPoint(point: Point): boolean;
        closestEdgeOfPoint(point: Point): [Point, Point];
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
        closestEdgeOfPoint(point: Point): [Point, Point];
    }
    interface Constraint {
        applyConstraint: () => void;
    }
    class Spring implements Constraint {
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
    class Frame extends Shape implements IntegrableBody, Constraint, CollidableBody {
        freeze: boolean;
        structure: Point[];
        springs: Spring[];
        constructor(points: Point[], freeze?: boolean, springStiffness?: number, springDamping?: number);
        applyConstraint(): void;
        update(dt: number): void;
    }
}
