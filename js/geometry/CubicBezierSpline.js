import { GameObject, minmax } from "../2DGameEngine.js";
export class CubicBezierSpline extends GameObject {
    cubicBeziers = [];
    constructor(cubicBeziers) {
        super();
        this.cubicBeziers = cubicBeziers;
    }
    get(t) {
        t = minmax(0, t, this.cubicBeziers.length);
        let floorT = Math.floor(minmax(0, t, this.cubicBeziers.length - 1));
        return this.cubicBeziers[floorT]?.get(t - floorT) ?? null;
    }
    getLengthAtT(t) {
        t = minmax(0, t, this.cubicBeziers.length);
        let floorT = Math.floor(minmax(0, t, this.cubicBeziers.length - 1));
        let length = 0;
        for (let index = 0; index < floorT; index++)
            length += this.cubicBeziers[index].length();
        return length + this.cubicBeziers[floorT].getLengthAtT(t - floorT);
    }
    getTAtLength(length) {
        length = minmax(0, length, this.length());
        let t = 0;
        for (let cb of this.cubicBeziers) {
            let cbLength = cb.length();
            if (cbLength < length) {
                length -= cbLength;
                t += 1;
            }
            else {
                t += cb.getTAtLength(length);
                return t;
            }
        }
        return t;
    }
    length() {
        let length = 0;
        for (let cb of this.cubicBeziers)
            length += cb.length();
        return length;
    }
    draw(ctx) {
        for (let cb of this.cubicBeziers)
            cb.executeDraw(ctx);
    }
}
