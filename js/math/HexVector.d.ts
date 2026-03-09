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
    constructor(orientation?: HexOrientation, unit?: number, q?: number, r?: number, s?: number, vector?: Vector);
    static fromVector(orientation: HexOrientation | undefined, unit: number | undefined, vector: Vector): HexVector;
    get q(): number;
    get r(): number;
    get s(): number;
    setS(q: number, r: number, s: number): this;
    set(hexVector: HexVector): this;
    addSSelf(q: number, r: number, s: number): this;
    addS(q: number, r: number, s: number): HexVector;
    addSelf(hexVector: HexVector): this;
    add(hexVector: HexVector): HexVector;
    subSSelf(q: number, r: number, s: number): this;
    subS(q: number, r: number, s: number): HexVector;
    subSelf(hexVector: HexVector): this;
    sub(hexVector: HexVector): HexVector;
    updateVector(): void;
    updateFromVector(): void;
    distanceTo(hexVector: HexVector): number;
    equal(hexVector: HexVector): boolean;
    equalS(q: number, r: number, s: number): boolean;
    clone(): HexVector;
    neighbors(): HexVector[];
    units(): HexVector[];
    static units(orientation: HexOrientation, unit: number): HexVector[];
    toString(): string;
}
