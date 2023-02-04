import { Vector } from "./Vector.js";
export declare enum HexOrientation {
    flat = 0,
    pointy = 1
}
export declare class HexVector {
    #private;
    orientation: HexOrientation;
    vector: Vector;
    unit: number;
    constructor(orientation?: HexOrientation, unit?: number, vector?: Vector, q?: number, r?: number, s?: number);
    get q(): number;
    get r(): number;
    get s(): number;
    setS(q: number, r: number, s: number): this;
    set(hexVector: HexVector): this;
    addS(q: number, r: number, s: number): this;
    add(hexVector: HexVector): this;
    updateVector(): void;
    updateFromVector(): void;
    distanceTo(hexVector: HexVector): number;
    equal(hexVector: HexVector): boolean;
    equalS(q: number, r: number, s: number): boolean;
    clone(): HexVector;
    neighbors(): HexVector[];
    units(): HexVector[];
    static units(orientation: HexOrientation, unit: number): HexVector[];
}
