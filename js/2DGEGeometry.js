import { GameObject } from "./2DGameEngine.js";
import { TransformMatrix, Vector } from "./2DGEMath.js";
/**
 * The Polygon represent a N point polygon
 * To work properly, it needs at least 3 point to close
 */
export class Polygon extends GameObject {
    #points = [];
    outer = [];
    inners = [];
    fill = false;
    /**
     * Create a new polygon using the given points
     *
     * @param points
     */
    constructor(outer = [], ...inners) {
        super();
        this.outer = outer;
        this.inners = inners;
    }
    /**
     * Returns a list of points, such that it represents the polygon with theorically no holes. Duplicates the first Vector at the end of the list for practical purposes
     *
     * @returns {Vector[]}
     */
    getLinear() {
        let points = [...this.outer, this.outer[0]];
        for (let inner of this.inners)
            points.push(...inner, points[0]);
        return points;
    }
    getWorldLinear() {
        let matrix = this.getWorldTransformMatrix();
        let points = this.getLinear();
        return points.map(point => TransformMatrix.multVec(matrix, point));
    }
    /**
     * Get the list of segments between the points in order
     * Returns an empty list if there is only one point
     *
     * @returns {Segment[]}
     */
    getSegments() {
        let segments = [];
        let points = this.getLinear();
        if (points.length < 3)
            return segments;
        for (let index = 0; index < points.length - 1; index++) {
            segments.push(new Segment(points[index].clone(), points[index + 1].clone()));
        }
        return segments;
    }
    getWorldSegment() {
        let segments = [];
        let points = this.getWorldLinear();
        if (points.length < 2)
            return segments;
        for (let index = 0; index < points.length; index++) {
            segments.push(new Segment(points[index].clone(), points[(index + 1) % points.length].clone()));
        }
        return segments;
    }
    /**
     * Draw the polygon
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (this.outer.length < 3)
            return;
        ctx.fillStyle = ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(this.outer[0].x, this.outer[0].y);
        for (let index = 1; index <= this.outer.length; index++) {
            ctx.lineTo(this.outer[index % this.outer.length].x, this.outer[index % this.outer.length].y);
        }
        ctx.closePath();
        for (let inner of this.inners) {
            ctx.moveTo(inner[0].x, inner[0].y);
            for (let index = 1; index <= inner.length; index++)
                ctx.lineTo(inner[index % inner.length].x, inner[index % inner.length].y);
            ctx.closePath();
        }
        if (this.fill)
            ctx.fill();
        else
            ctx.stroke();
    }
    containsVector(vector) {
        let segments = this.getSegments();
        let count = 0;
        let ray = new Ray(vector, new Vector(1, 0));
        for (let segment of segments)
            if (ray.intersect(segment))
                count++;
        return (count & 1) === 1;
    }
    containsWorldVector(vector) {
        let segments = this.getWorldSegment();
        let count = 0;
        let ray = new Ray(vector, new Vector(1, 0));
        for (let segment of segments)
            if (ray.intersect(segment))
                count++;
        return (count & 1) === 1;
    }
}
/**
 *
 */
export class Rectangle extends Polygon {
    display = false;
    displayColor = 'red';
    #ptmem = [new Vector(), new Vector()];
    constructor(x = 0, y = 0, w = 1, h = 1, display = false, displayColor = 'red') {
        super([], []);
        this.transform.translation.set(x, y);
        this.transform.scale.set(w, h);
        this.#ptmem[0].copy(this.transform.translation);
        this.#ptmem[1].copy(this.transform.scale);
        this.display = display;
        this.displayColor = displayColor;
    }
    getLinear() {
        if (this.outer.length === 0 || !this.#ptmem[0].equal(this.transform.translation) || !this.#ptmem[1].equal(this.transform.scale)) {
            this.outer = [this.topleft, this.bottomleft, this.bottomright, this.topright];
            this.#ptmem[0].copy(this.transform.translation);
            this.#ptmem[1].copy(this.transform.translation);
        }
        return super.getLinear();
    }
    get x() { return this.transform.translation.x; }
    set x(n) { this.transform.translation.x = n; }
    get y() { return this.transform.translation.y; }
    set y(n) { this.transform.translation.y = n; }
    get w() { return this.transform.scale.x; }
    set w(n) { this.transform.scale.x = n; }
    get h() { return this.transform.scale.y; }
    set h(n) { this.transform.scale.y = n; }
    get halfW() { return this.transform.scale.x / 2; }
    set halfW(n) { this.transform.scale.x = n * 2; }
    get halfH() { return this.transform.scale.y / 2; }
    set halfH(n) { this.transform.scale.y = n * 2; }
    get left() { return this.transform.translation.x - this.halfW; }
    set left(n) { this.transform.translation.x = n + this.halfW; }
    get right() { return this.transform.translation.x + this.halfW; }
    set right(n) { this.transform.translation.x = n - this.halfW; }
    get bottom() { return this.transform.translation.y - this.halfH; }
    set bottom(n) { this.transform.translation.y = n + this.halfH; }
    get top() { return this.transform.translation.y + this.halfH; }
    set top(n) { this.transform.translation.y = n - this.halfH; }
    get topleft() { return new Vector(this.left, this.top); }
    set topleft(v) { this.left = v.x; this.top = v.y; }
    get bottomleft() { return new Vector(this.left, this.bottom); }
    set bottomleft(v) { this.left = v.x; this.bottom = v.y; }
    get topright() { return new Vector(this.right, this.top); }
    set topright(v) { this.right = v.x; this.top = v.y; }
    get bottomright() { return new Vector(this.right, this.bottom); }
    set bottomright(v) { this.right = v.x; this.bottom = v.y; }
    contains(vector) { return vector.x <= this.right && vector.x >= this.left && vector.y <= this.top && vector.y >= this.bottom; }
    collide(rect) {
        return this.left < rect.right &&
            rect.left < this.right &&
            this.bottom < rect.top &&
            rect.bottom < this.top;
    }
    draw(ctx) {
        if (this.display) {
            ctx.save();
            ctx.scale(1 / this.w, 1 / this.h);
            ctx.strokeStyle = this.displayColor;
            ctx.strokeRect(this.left, this.bottom, this.w, this.h);
            ctx.fillStyle = this.displayColor;
            ctx.fillRect(-1, -1, 2, 2);
            ctx.restore();
        }
        return true;
    }
    clone() {
        return new Rectangle(this.x, this.y, this.w, this.h);
    }
    copy(rectangle) {
        this.x = rectangle.x;
        this.y = rectangle.y;
        this.w = rectangle.w;
        this.h = rectangle.h;
        return this;
    }
    toString() {
        return `Rectangle(${this.x}, ${this.y}, ${this.w}, ${this.h})`;
    }
}
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
export class RayCastView {
    static compute(position, segments, infinity = 1000) {
        let uniques = [
            Vector.fromAngle(Math.PI / 4).multS(infinity),
            Vector.fromAngle(Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI * 3 / 4).multS(infinity),
            Vector.fromAngle(-Math.PI / 4).multS(infinity)
        ];
        for (let segment of segments) {
            let sega = segment.getWorldPosition(segment.a.clone());
            let segb = segment.getWorldPosition(segment.b.clone());
            if (!uniques.some(pt => pt.equal(sega)))
                uniques.push(sega);
            if (!uniques.some(pt => pt.equal(segb)))
                uniques.push(segb);
        }
        let points = [];
        for (let unique of uniques) {
            let angle = unique.clone().sub(position).angle();
            let angle1 = angle + 0.00001;
            let angle2 = angle - 0.00001;
            let ray = new Ray(position.clone(), Vector.fromAngle(angle));
            let ray1 = new Ray(position.clone(), Vector.fromAngle(angle1));
            let ray2 = new Ray(position.clone(), Vector.fromAngle(angle2));
            let pt = ray.cast(segments);
            let pt1 = ray1.cast(segments);
            let pt2 = ray2.cast(segments);
            points.push([angle, pt ?? position.clone().add(ray.direction.multS(infinity)), pt?.clone().sub(position) ?? ray.direction]);
            points.push([angle1, pt1 ?? position.clone().add(ray1.direction.multS(infinity)), pt1?.clone().sub(position) ?? ray1.direction]);
            points.push([angle2, pt2 ?? position.clone().add(ray2.direction.multS(infinity)), pt2?.clone().sub(position) ?? ray2.direction]);
        }
        points.sort((a, b) => b[0] - a[0]);
        let polygon = new Polygon(points.map(e => e[2]));
        return polygon;
    }
    static cropPolygon(ctx, polygon) {
        let points = polygon.getLinear();
        if (points.length < 4)
            return;
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let index = 1; index < points.length - 1; index++)
            ctx.lineTo(points[index].x, points[index].y);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
}
