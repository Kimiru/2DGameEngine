import { GameObject, Vector } from "../2DGameEngine.js";
export declare class CubicBezier extends GameObject {
    #private;
    get point_0(): Vector;
    get control_0(): Vector;
    get control_1(): Vector;
    get point_1(): Vector;
    lineWidth: number;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    /**
     *
     * @param point_0
     * @param control_0
     * @param control_1
     * @param point_1
     */
    constructor(point_0: Vector, control_0: Vector, control_1: Vector, point_1: Vector);
    get(t: number): Vector;
    getLengthAtT(t: number): number;
    getTAtLength(length: number): number;
    length(): number;
    invalidateCache(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
