import { GameObject } from "../basics/GameObject.js";
import { Vector } from "../math/Vector.js";
export class Ray extends GameObject {
    direction = new Vector();
    constructor(position, direction) {
        super();
        this.transform.translation.copy(position);
        this.direction = direction;
    }
    intersect(segment) {
        let sega = segment.getWorldPosition(segment.a.clone());
        let segb = segment.getWorldPosition(segment.b.clone());
        let wp = this.getWorldPosition();
        let wpdir = this.getWorldPosition(this.direction.clone().normalize());
        let x1 = sega.x;
        let y1 = sega.y;
        let x2 = segb.x;
        let y2 = segb.y;
        let x3 = wp.x;
        let y3 = wp.y;
        let x4 = wpdir.x;
        let y4 = wpdir.y;
        let denum = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denum === 0)
            return null;
        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denum;
        let u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denum;
        if (t < 0 || t > 1 || u < 0)
            return null;
        return new Vector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    }
    cast(segments) {
        let result = null;
        let length = 0;
        for (let segment of segments) {
            let intersect = this.intersect(segment);
            if (intersect) {
                let intersectLength = this.transform.translation.distanceTo(intersect);
                if (result === null || intersectLength < length) {
                    result = intersect;
                    length = intersectLength;
                }
            }
        }
        return result;
    }
    draw(ctx) {
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(-this.transform.scale.x, -this.transform.scale.y, this.transform.scale.x * 2, this.transform.scale.y * 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.direction.x * this.transform.scale.x * 5, this.direction.y * this.transform.scale.y * 5);
        ctx.stroke();
        return true;
    }
}
