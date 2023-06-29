import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
import { Segment } from "./Segment.js";
export declare class Ray extends GameObject {
    direction: Vector;
    constructor(position: Vector, direction: Vector);
    intersect(segment: Segment): Vector | null;
    cast(segments: Segment[]): Vector | null;
    draw(ctx: CanvasRenderingContext2D): boolean;
}
