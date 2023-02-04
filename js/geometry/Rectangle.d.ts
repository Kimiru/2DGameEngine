import { Vector } from "../math/Vector.js";
import { Polygon } from "./Polygon.js";
/**
 *
 */
export declare class Rectangle extends Polygon {
    #private;
    display: boolean;
    displayColor: string;
    constructor(x?: number, y?: number, w?: number, h?: number, display?: boolean, displayColor?: string);
    getLinear(): Vector[];
    get x(): number;
    set x(n: number);
    get y(): number;
    set y(n: number);
    get w(): number;
    set w(n: number);
    get h(): number;
    set h(n: number);
    get halfW(): number;
    set halfW(n: number);
    get halfH(): number;
    set halfH(n: number);
    get left(): number;
    set left(n: number);
    get right(): number;
    set right(n: number);
    get bottom(): number;
    set bottom(n: number);
    get top(): number;
    set top(n: number);
    get topleft(): Vector;
    set topleft(v: Vector);
    get bottomleft(): Vector;
    set bottomleft(v: Vector);
    get topright(): Vector;
    set topright(v: Vector);
    get bottomright(): Vector;
    set bottomright(v: Vector);
    contains(vector: Vector): boolean;
    collide(rect: Rectangle): boolean;
    draw(ctx: CanvasRenderingContext2D): boolean;
    clone(): Rectangle;
    copy(rectangle: Rectangle): this;
    toString(): string;
}
