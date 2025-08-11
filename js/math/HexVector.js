import { Vector } from "./Vector.js";
export var HexOrientation;
(function (HexOrientation) {
    HexOrientation[HexOrientation["flat"] = 0] = "flat";
    HexOrientation[HexOrientation["pointy"] = 1] = "pointy";
})(HexOrientation || (HexOrientation = {}));
export class HexVector {
    orientation;
    #q = 0;
    #r = 0;
    #s = 0;
    vector;
    unit;
    constructor(orientation = HexOrientation.pointy, unit = 1, q = 0, r = 0, s = 0, vector = new Vector()) {
        this.orientation = orientation;
        this.unit = unit;
        this.vector = vector;
        this.setS(q, r, s);
    }
    static fromVector(orientation = HexOrientation.pointy, unit = 1, vector) {
        let hex = new HexVector(orientation, unit);
        hex.vector.copy(vector);
        hex.updateFromVector();
        return hex;
    }
    get q() { return this.#q; }
    get r() { return this.#r; }
    get s() { return this.#s; }
    setS(q, r, s) {
        let sum = q + r + s;
        if (sum !== 0)
            throw `Check sum for hex positioning should be equal to zero q(${this.#q + q}) + r(${this.#r + r}) + s(${this.#s + s}) === ${sum}`;
        this.#q = q;
        this.#r = r;
        this.#s = s;
        this.updateVector();
        return this;
    }
    set(hexVector) {
        return this.setS(hexVector.q, hexVector.r, hexVector.s);
    }
    addS(q, r, s) {
        let sum = this.#q + q + this.#r + r + this.#s + s;
        if (sum !== 0)
            throw `Check sum for hex positioning should be equal to zero q(${this.#q + q}) + r(${this.#r + r}) + s(${this.#s + s}) === ${sum}`;
        this.#q += q;
        this.#r += r;
        this.#s += s;
        this.updateVector();
        return this;
    }
    add(hexVector) {
        return this.addS(hexVector.q, hexVector.r, hexVector.s);
    }
    updateVector() {
        let sqrt3 = Math.sqrt(3);
        if (this.orientation === HexOrientation.pointy)
            this.vector.set(this.unit * (sqrt3 * this.#q + sqrt3 / 2 * this.#r), this.unit * (3 / 2 * this.#r));
        else
            this.vector.set(this.unit * (3 / 2 * this.#q), this.unit * (sqrt3 / 2 * this.#q + sqrt3 * this.#r));
    }
    updateFromVector() {
        let fracQ, fracR;
        if (this.orientation === HexOrientation.pointy) {
            fracQ = (Math.sqrt(3) / 3 * this.vector.x - 1 / 3 * this.vector.y) / this.unit;
            fracR = (2 / 3 * this.vector.y) / this.unit;
        }
        else {
            fracQ = (2 / 3 * this.vector.x) / this.unit;
            fracR = (-1 / 3 * this.vector.x + Math.sqrt(3) / 3 * this.vector.y) / this.unit;
        }
        let fracS = -fracQ - fracR;
        let q = Math.round(fracQ);
        let r = Math.round(fracR);
        let s = Math.round(fracS);
        let qDiff = Math.abs(q - fracQ);
        let rDiff = Math.abs(r - fracR);
        let sDiff = Math.abs(s - fracS);
        if (qDiff > rDiff && qDiff > sDiff)
            q = -r - s;
        else if (rDiff > sDiff)
            r = -q - s;
        else
            s = -q - r;
        this.setS(q, r, s);
    }
    distanceTo(hexVector) {
        if (this.orientation !== hexVector.orientation)
            throw 'HexVector have incompatible orientations';
        return (Math.abs(this.q - hexVector.q) + Math.abs(this.r - hexVector.r) + Math.abs(this.s - hexVector.s)) / 2;
    }
    equal(hexVector) { return this.#q === hexVector.q && this.#r === hexVector.r && this.#s === hexVector.s; }
    equalS(q, r, s) { return this.#q === q && this.#r === r && this.#s === s; }
    clone() { return new HexVector(this.orientation, this.unit, this.#q, this.#r, this.#s); }
    neighbors() {
        return this.units().map((hexVector) => hexVector.add(this));
    }
    units() { return HexVector.units(this.orientation, this.unit); }
    static units(orientation, unit) {
        return [
            new HexVector(orientation, unit, 1, -1, 0),
            new HexVector(orientation, unit, -1, 1, 0),
            new HexVector(orientation, unit, 0, 1, -1),
            new HexVector(orientation, unit, 0, -1, 1),
            new HexVector(orientation, unit, 1, 0, -1),
            new HexVector(orientation, unit, -1, 0, 1),
        ];
    }
}
