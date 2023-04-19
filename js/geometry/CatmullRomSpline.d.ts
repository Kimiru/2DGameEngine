import { GameObject, Vector } from "../2DGameEngine.js";
import { HermiteSpline } from "./HermiteSpline.js";
export declare class CatmullRomSpline extends GameObject {
    points: Vector[];
    loop: boolean;
    constructor(points: Vector[]);
    getHermiteSpline(): HermiteSpline;
    draw(ctx: CanvasRenderingContext2D): void;
}
