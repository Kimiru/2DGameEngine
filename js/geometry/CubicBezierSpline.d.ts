import { GameObject, Vector } from "../2DGameEngine.js";
import { CubicBezier } from "./CubicBezier.js";
export declare class CubicBezierSpline extends GameObject {
    cubicBeziers: CubicBezier[];
    constructor(cubicBeziers: CubicBezier[]);
    get(t: number): Vector;
    getLengthAtT(t: number): number;
    getTAtLength(length: number): number;
    length(): number;
    draw(ctx: CanvasRenderingContext2D): void;
}
