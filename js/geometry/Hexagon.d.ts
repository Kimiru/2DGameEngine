import { HexOrientation } from "../math/HexVector.js";
import { Vector } from "../math/Vector.js";
import { Polygon } from "./Polygon.js";
export declare class Hexagon extends Polygon {
    unit: number;
    orientation: HexOrientation;
    display: boolean;
    color: string;
    constructor(position?: Vector, orientation?: HexOrientation, unit?: number);
    getLinear(): Vector[];
    static ctxPath(ctx: CanvasRenderingContext2D, orientation: HexOrientation, unit: number): void;
    ctxPath(ctx: any): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
