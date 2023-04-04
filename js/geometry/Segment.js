import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
const PI_DIV_2 = Math.PI / 2;
export class Segment extends GameObject {
    a = new Vector();
    b = new Vector();
    display = false;
    lineWidth = 1;
    constructor(a, b, display = false) {
        super();
        this.a = a;
        this.b = b;
        this.display = display;
    }
    intersect(segment) {
        let seg1a = segment.getWorldPosition(segment.a.clone());
        let seg1b = segment.getWorldPosition(segment.b.clone());
        let seg2a = this.getWorldPosition(this.a.clone());
        let seg2b = this.getWorldPosition(this.b.clone());
        let x1 = seg1a.x;
        let y1 = seg1a.y;
        let x2 = seg1b.x;
        let y2 = seg1b.y;
        let x3 = seg2a.x;
        let y3 = seg2a.y;
        let x4 = seg2b.x;
        let y4 = seg2b.y;
        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denum === 0)
            return null;
        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum;
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum;
        if (t < 0 || t > 1 || u < 0 || u > 1)
            return null;
        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
    project(point) {
        let dir = this.b.clone().sub(this.a);
        let vec = point.clone().sub(this.a);
        let fix = false;
        if (dir.x === 0)
            fix = true;
        if (fix) {
            dir.rotate(PI_DIV_2);
            vec.rotate(PI_DIV_2);
        }
        let t = ((vec.x * dir.x + vec.y * dir.y) / (dir.x * dir.x + dir.y * dir.y)) * dir.x;
        let offset = new Vector(t, t * (dir.y / dir.x));
        if (fix) {
            offset.rotate(-PI_DIV_2);
        }
        return this.a.clone().add(offset);
    }
    length() {
        return this.a.distanceTo(this.b);
    }
    draw(ctx) {
        if (this.display) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.lineWidth = this.lineWidth;
            ctx.moveTo(this.a.x, this.a.y);
            ctx.lineTo(this.b.x, this.b.y);
            ctx.stroke();
        }
        return true;
    }
}
