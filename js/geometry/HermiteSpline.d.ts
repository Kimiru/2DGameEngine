import { GameObject, Vector } from "../2DGameEngine.js";
import { CubicBezierSpline } from "./CubicBezierSpline.js";
export interface HermiteSplineNode {
    position: Vector;
    direction: Vector;
}
export declare class HermiteSpline extends GameObject {
    nodes: HermiteSplineNode[];
    constructor(nodes: HermiteSplineNode[]);
    getCubicBezierSpline(): CubicBezierSpline;
    draw(ctx: CanvasRenderingContext2D): void;
}
