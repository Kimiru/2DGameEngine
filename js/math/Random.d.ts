import { Vector } from "./Vector.js";
export declare class PseudoRandom {
    static a: number;
    static c: number;
    static m: number;
    seed: number;
    a: number;
    c: number;
    m: number;
    constructor(seed?: number);
    get(): number;
    static get(seed?: number): number;
}
export declare class PerlinNoise {
    rng: PseudoRandom;
    seed: number;
    grid: Vector[][][];
    horizontalLoop: number;
    verticalLoop: number;
    depthLoop: number;
    constructor(seed?: number, horizontalLoop?: number, verticalLoop?: number, depthLoop?: number);
    fade(t: number): number;
    getVector(ix: number, iy: number, iz: number): Vector;
    gradDotProduct(ix: number, iy: number, iz: number, x: number, y: number, z: number): number;
    get(x: number, y: number, z?: number): number;
}
