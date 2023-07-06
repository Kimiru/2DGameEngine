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
        resolveCollision(point: Point, collidableBody: CollidableBody, frixion?: number, absorption?: number): void;
        resolveEdgeCollision(P: Point, [A, B]: [Point, Point]): void;
        resolveEdgeCollisionPosition({ position: P }: Point, [{ position: A }, { position: B }]: [Point, Point]): void;
        resolveEdgeCollisionVelocity(P: Point, [A, B]: [Point, Point], frixion: any, absorption: any): void;
    }
    interface IntegrableBody {
        integrate: (dt: number) => void;
        getPoints(): Point[];
    }
    interface CollidableBody {
        absorption: number;
        frixion: number;
        containsPoint(point: Point): boolean;
        closestEdgeOfPoint(point: Point): [Point, Point];
    }
    class Point implements IntegrableBody {
        position: Vector;
        velocity: Vector;
        acceleration: Vector;
        frixion: number;
        absorption: number;
        freeze: boolean;
        constructor(position?: Vector, velocity?: Vector, acceleration?: Vector, frixion?: number, absorption?: number, freeze?: boolean);
        getPoints(): Point[];
        integrate(dt: number): void;
    }
    class Shape extends GameObject implements IntegrableBody, CollidableBody {
        points: Point[];
        frixion: number;
        absorption: number;
        constructor(points: Point[], frixion?: number, absorption?: number);
        getPoints(): Point[];
        getPointsCenter(): Vector;
        integrate(dt: number): void;
        containsPoint(point: Point): boolean;
        distancePointToEdge(point: Vector, [A, B]: [Vector, Vector]): number;
        closestEdgeOfPoint(point: Point): [Point, Point];
        addForce(force: Vector): void;
    }
    interface Constraint {
        applyConstraint: () => void;
    }
    class Spring implements Constraint {
        static stiffness: number;
        static damping: number;
        static angularDamping: number;
        point_0: Point;
        point_1: Point;
        stiffness: number;
        damping: number;
        angularDamping: number;
        restLength: number;
        constructor(point_0: Point, point_1: Point, stiffness?: number, damping?: number, restLength?: number, angularDamping?: number);
        relaxSpring(): void;
        applyConstraint(): void;
    }
    class Frame extends Shape implements IntegrableBody, Constraint, CollidableBody {
        freeze: boolean;
        falseStructure: Point[];
        structure: Point[];
        springs: Spring[];
        constructor(points: Point[], freeze?: boolean, springStiffness?: number, springDamping?: number, frixion?: number, absorption?: number);
        applyConstraint(): void;
        getFrameCenter(): Vector;
        integrate(dt: number): void;
    }
}
