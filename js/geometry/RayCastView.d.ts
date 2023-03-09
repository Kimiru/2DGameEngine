import { Vector } from "../math/Vector.js";
import { Polygon } from "./Polygon.js";
import { Segment } from "./Segment.js";
export declare class RayCastView {
    static compute(position: Vector, segments: Segment[], infinity?: number, infinityPoints?: number, centeredOnPosition?: boolean): Polygon;
    static cropPolygon(ctx: CanvasRenderingContext2D, polygon: Polygon): void;
}
