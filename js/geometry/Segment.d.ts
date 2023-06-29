import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
export declare class Segment extends GameObject {
    a: Vector;
    b: Vector;
    display: boolean;
    lineWidth: number;
    constructor(a: Vector, b: Vector, display?: boolean);
    intersect(segment: Segment): Vector | null;
    directionVector(): Vector;
    project(point: Vector): Vector;
    length(): number;
    draw(ctx: CanvasRenderingContext2D): boolean;
}
