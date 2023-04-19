import { GameObject } from "../2DGameEngine.js";
import { HermiteSpline } from "./HermiteSpline.js";
export class CatmullRomSpline extends GameObject {
    points = [];
    loop = false;
    constructor(points, loop = false) {
        super();
        this.points = points;
        this.loop = loop;
    }
    getHermiteSpline() {
        if (this.points.length < 3)
            return null;
        let nodes = [];
        let points = [...this.points];
        if (this.loop) {
            points.unshift(this.points[this.points.length - 1]);
            points.push(this.points[0], this.points[1]);
        }
        for (let index = 1; index < points.length - 1; index++) {
            let p_0 = points[index - 1];
            let p_1 = points[index];
            let p_2 = points[index + 1];
            let dir = p_2.clone().sub(p_0).divS(2);
            nodes.push({ position: p_1.clone(), direction: dir });
        }
        return new HermiteSpline(nodes);
    }
    draw(ctx) {
        this.getHermiteSpline()?.executeDraw(ctx);
    }
}
