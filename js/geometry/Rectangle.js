import { Vector } from "../math/Vector.js";
import { Polygon } from "./Polygon.js";
/**
 *
 */
export class Rectangle extends Polygon {
    display = false;
    displayColor = 'red';
    #ptmem = [new Vector(), new Vector()];
    constructor(x = 0, y = 0, w = 1, h = 1, display = false, displayColor = 'red') {
        super([], []);
        this.addTag('rectangle');
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
            ctx.fillStyle = this.displayColor;
            ctx.fillRect(-.5, -.5, 1, 1);
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
