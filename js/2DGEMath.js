import { range } from "./2DGEUtils.js";
const PI2 = Math.PI * 2;
/**
 * class Vector represent a 3 dimentional vector
 * it also contains function that are used in 2d context for practical purposes
 */
export class Vector {
    x = 0;
    y = 0;
    z = 0;
    /**
     * Create a new 3D Vector
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
    * Set this vector values to the given values
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {this}
    */
    set(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    /**
     * Add the given vector to this vector
     *
     * @param {Vector} vector
     * @returns {this}
     */
    add(vector = new Vector()) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }
    /**
     * Add the given numbers to this vector
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {this}
     */
    addS(x = 0, y = 0, z = 0) {
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }
    /**
     * Sub the given vector to this vector
     *
     * @param {Vector} vector
     * @returns {this}
     */
    sub(vector = new Vector()) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }
    /**
    * Sub the given numbers to this vector
    *
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {this}
    */
    subS(x = 0, y = 0, z = 0) {
        this.x -= x;
        this.y -= y;
        this.z -= z;
        return this;
    }
    /**
     * Multiply each of this vector value by each of the given vector value
     *
     * @param {Vector} vector
     * @returns {this}
     */
    mult(vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        return this;
    }
    /**
     * Multiply this vector by a given value
     *
     * @param {number} n
     * @returns {this}
     */
    multS(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }
    /**
    * Divide each of this vector value by each of the given vector value
    *
    * @param {Vector} vector
    * @returns {this}
    */
    div(vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        return this;
    }
    /**
     * Divide this vector by a given value
     *
     * @param {number} n
     * @returns {this}
     */
    divS(n) {
        this.x /= n;
        this.y /= n;
        this.z /= n;
        return this;
    }
    /**
     * Returns the result of the dot product between this vector and the given vector
     *
     * @param {Vector} vector
     * @returns {number}
     */
    dot(vector) { return this.x * vector.x + this.y * vector.y + this.z * vector.z; }
    /**
     * Returns the length of this vector
     *
     * @returns {number}
     */
    length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    /**
     * Returns true if the length of this vector is 0
     *
     * @returns {boolean}
     */
    nil() { return this.x == 0 && this.y == 0 && this.z == 0; }
    /**
     * Normalizes this vector if it is not nil
     *
     * @returns {this}
     */
    normalize() {
        if (!this.nil())
            this.divS(this.length());
        return this;
    }
    /**
     * Rotates the current vector of a given angle on the x and y values
     *
     * @param {number} angle
     * @returns {this}
     */
    rotate(angle) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let x = cos * this.x - sin * this.y;
        let y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    }
    /**
     * Rotate the current vector of a given angle arround a given position on the x and y values
     *
     * @param {Vector} position
     * @param {number} angle
     * @returns {this}
     */
    rotateAround(position, angle) {
        this.sub(position);
        this.rotate(angle);
        this.add(position);
        return this;
    }
    /**
     * Returns the angle between this vector and the given vector
     *
     * @param vector
     * @returns {number}
     */
    angleTo(vector) { return Math.acos(this.dot(vector) / (this.length() * vector.length())); }
    /**
     * Returns the angle on this vector on plane x, y
     *
     * @returns {number}
     */
    angle() {
        let vec = this.clone().normalize();
        return Math.acos(vec.x) * Math.sign(vec.y);
    }
    /**
     * Returns the distance from this Vector position to the given Vector position
     *
     * @param {Vector} vector
     * @returns {number}
     */
    distanceTo(vector) { return this.clone().sub(vector).length(); }
    /**
     * Copy the given vector values to this vector
     *
     * @param {Vector} vector
     */
    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        return this;
    }
    /**
     * A new instance clone of this vector
     *
     * @returns {Vector}
     */
    clone() { return new Vector(this.x, this.y, this.z); }
    /**
     * Returns true if this vector values are equal to the given vector values
     *
     * @param {Vector} vector
     * @returns {boolean}
     */
    equal(vector) { return this.x == vector.x && this.y == vector.y && this.z == vector.z; }
    /**
     * Returns true if this vector values are equal to the given values
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {boolean}
     */
    equalS(x = 0, y = 0, z = 0) { return this.x == x && this.y == y && this.z == z; }
    /**
     * Converts this vector to a string
     *
     * @returns {string}
     */
    toString() { return `Vector(${this.x}, ${this.y}, ${this.z})`; }
    /**
     * Returns a new unit vector from the given angle
     *
     * @param {number} angle
     * @returns {Vector}
     */
    static fromAngle(angle) { return new Vector(Math.cos(angle), Math.sin(angle)); }
    static distanceBetween(a, b) { return a.distanceTo(b); }
    exec(func) {
        func(this);
        return this;
    }
    /**
     *
     * @returns {this}
     */
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }
    /**
     *
     * @returns {this}
     */
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }
    abs() {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        this.z = Math.abs(this.z);
        return this;
    }
}
export class HexOrientation {
    static flat = 0;
    static pointy = 1;
}
export class HexVector {
    orientation;
    #q = 0;
    #r = 0;
    #s = 0;
    vector;
    unit;
    constructor(orientation = HexOrientation.pointy, unit = 1, vector = new Vector(), q = 0, r = 0, s = 0) {
        this.orientation = orientation;
        this.unit = unit;
        this.vector = vector;
        this.addS(q, r, s);
    }
    get q() { return this.#q; }
    get r() { return this.#r; }
    get s() { return this.#s; }
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
    distanceTo(hexVector) {
        if (this.orientation !== hexVector.orientation)
            throw 'HexVector have incompatible orientations';
        return (Math.abs(this.q - hexVector.q) + Math.abs(this.r - hexVector.r) + Math.abs(this.s - hexVector.s)) / 2;
    }
    equal(hexVector) { return this.#q === hexVector.q && this.#r === hexVector.r && this.#s === hexVector.s; }
    equalS(q, r, s) { return this.#q === q && this.#r === r && this.#s === s; }
    clone() { return new HexVector(this.orientation, this.unit, this.vector, this.#q, this.#r, this.#s); }
    neighbors() {
        return this.units().map((hexVector) => hexVector.add(this));
    }
    units() { return HexVector.units(this.orientation, this.unit); }
    static units(orientation, unit) {
        return [
            new HexVector(orientation, unit, undefined, 1, -1, 0),
            new HexVector(orientation, unit, undefined, -1, 1, 0),
            new HexVector(orientation, unit, undefined, 0, 1, -1),
            new HexVector(orientation, unit, undefined, 0, -1, 1),
            new HexVector(orientation, unit, undefined, 1, 0, -1),
            new HexVector(orientation, unit, undefined, -1, 0, 1),
        ];
    }
}
export class Transform {
    translation = new Vector();
    #rotation = 0;
    scale = new Vector();
    constructor(translation = new Vector(0, 0, 0), rotation = 0, scale = new Vector(1, 1, 1)) {
        this.translation.copy(translation);
        this.rotation = rotation;
        this.scale.copy(scale);
    }
    /**
    * Return the rotation of the object
    *
    * @returns {number}
    */
    get rotation() { return this.#rotation; }
    /**
     * Set the rotation of the object
     * The angle is automatically converted into modulo 2.PI > 0
     *
     * @param {number} angle
     */
    set rotation(angle) {
        this.#rotation = ((angle % PI2) + PI2) % PI2;
    }
    clear() {
        this.translation.set(0, 0, 0);
        this.rotation = 0;
        this.scale.set(1, 1, 1);
    }
    isDefault() {
        return this.translation.x === 0 && this.translation.y === 0 &&
            this.#rotation == 0 &&
            this.scale.x === 1 && this.scale.y === 1;
    }
    getMatrix() {
        let cos = Math.cos(this.#rotation);
        let sin = Math.sin(this.#rotation);
        let sx = this.scale.x;
        let sy = this.scale.y;
        let x = this.translation.x;
        let y = this.translation.y;
        return [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ];
    }
    getInvertMatrix() {
        let cos = Math.cos(-this.#rotation);
        let sin = Math.sin(-this.#rotation);
        let sx = 1 / this.scale.x;
        let sy = 1 / this.scale.y;
        let x = -this.translation.x * cos * sx + -this.translation.x * -sin * sx;
        let y = -this.translation.y * sin * sy + -this.translation.y * cos * sy;
        return [
            cos * sx,
            sin * sx,
            -sin * sy,
            cos * sy,
            x,
            y
        ];
    }
    toString() {
        let str = 'Transform( ';
        if (this.translation.x !== 0 || this.translation.y !== 0)
            str += this.translation.toString() + ' ';
        if (this.rotation !== 0)
            str += this.rotation + ' ';
        if (this.scale.x !== 1 || this.scale.y !== 1)
            str += this.scale.toString() + ' ';
        str += ')';
        return str;
    }
}
export class PositionIntegrator {
    previousPosition = new Vector();
    previousVelocity = new Vector();
    previousAcceleration = new Vector();
    position = new Vector();
    velocity = new Vector();
    acceleration = new Vector();
    constructor() { }
    integrate(t) {
        let tt = t * t;
        this.previousPosition.copy(this.position);
        this.previousVelocity.copy(this.velocity);
        this.previousAcceleration.copy(this.acceleration);
        this.position
            .add(this.velocity.clone().multS(t))
            .add(this.acceleration.clone().multS(tt * 1 / 2));
        this.velocity.add(this.acceleration.clone().multS(t));
    }
    positionHasChanged() { return !this.previousPosition.equal(this.position); }
    velocityHasChanged() { return !this.previousVelocity.equal(this.velocity); }
    accelerationHasChanged() { return !this.previousAcceleration.equal(this.acceleration); }
}
export class TransformMatrix {
    static multMat(m1, m2) {
        return [
            m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
        ];
    }
    /**
     * Multiply the given matrix by the given Vector. Mutation safe
     *
     * @param m1
     * @param vec
     * @returns
     */
    static multVec(m1, vec) {
        return new Vector(m1[0] * vec.x + m1[2] * vec.y + m1[4], m1[1] * vec.x + m1[3] * vec.y + m1[5], 0);
    }
}
export class Graph {
    nodes = new Set();
    nodesObjects = new Map();
    links = new Map();
    display = false;
    positionGetter = null;
    constructor(display = false, positionGetter = null) {
        this.display = display;
        this.positionGetter = positionGetter;
    }
    /**
     *
     * @param {...number} nodes
     */
    addNode(...nodes) {
        for (let [node, object] of nodes) {
            if (!this.nodes.has(node)) {
                this.nodes.add(node);
                this.nodesObjects.set(node, object);
                this.links.set(node, new Set());
            }
        }
    }
    /**
     *
     * @param {...number} nodes
     */
    removeNode(...nodes) {
        for (let node of nodes)
            if (this.hasNode(node)) {
                this.nodes.delete(node);
                this.nodesObjects.delete(node);
                this.links.delete(node);
                for (let [, map] of this.links)
                    map.delete(node);
            }
    }
    /**
     *
     * @param {number} node
     * @returns {boolean}
     */
    hasNode(node) { return this.nodes.has(node); }
    /**
     *
     * @param {...{source:number, target:number, data:any}} links
     */
    addLink(...links) {
        for (let link of links) {
            if (!this.hasNode(link.source) || !this.hasNode(link.target))
                continue;
            this.links.get(link.source).add(link.target);
        }
    }
    /**
     *
     * @param {...{source:number, target:number}} links
     */
    removeLink(...links) {
        for (let link of links)
            if (this.hasLink(link.source, link.target)) {
                this.links.get(link.source).delete(link.target);
            }
    }
    hasLink(source, target) { return this.links.has(source) && this.links.get(source).has(target); }
    isConnectedTo(source, target) {
        if (!this.hasNode(source))
            return false;
        if (!this.hasNode(target))
            return false;
        let nodeSet;
        let currentSet = new Set([source]);
        do {
            nodeSet = currentSet;
            currentSet = new Set(nodeSet);
            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target);
        } while (nodeSet.size != currentSet.size);
        return nodeSet.has(target);
    }
    isConnected(node) {
        if (!this.hasNode(node))
            return true;
        let nodeSet;
        let currentSet = new Set([node]);
        do {
            nodeSet = currentSet;
            currentSet = new Set(nodeSet);
            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target);
        } while (nodeSet.size != currentSet.size);
        return nodeSet.size == this.nodes.size;
    }
    isFullyConnected() {
        for (let node of this.nodes)
            if (!this.isConnected(node))
                return false;
        return true;
    }
    getShortestPathBetween(source, target, estimateDistance) {
        if (!this.hasNode(source) || !this.hasNode(target))
            return null;
        let nodes = new Map();
        this.nodes.forEach(id => nodes.set(id, new Node(id)));
        let start = nodes.get(source);
        let end = nodes.get(target);
        let closed = [];
        let opened = [start];
        while (opened.length) {
            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.heuristic < b.heuristic ? a : b)), 1)[0];
            let currentObject = this.nodesObjects.get(current.id);
            if (current == end) {
                let list = [end.id];
                let node = end;
                while (node.previous) {
                    node = node.previous;
                    list.push(node.id);
                }
                return list.reverse();
            }
            for (let neighbour of this.links.get(current.id)) {
                let node = nodes.get(neighbour);
                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id));
                if (!(closed.includes(node) || (opened.includes(node) && node.cost <= cost))) {
                    node.cost = cost;
                    node.heuristic = node.cost + estimateDistance(this.nodesObjects.get(node.id), this.nodesObjects.get(end.id));
                    node.previous = current;
                    opened.push(node);
                }
            }
            closed.push(current);
        }
        return null;
    }
    draw(ctx) {
        if (this.display && this.positionGetter) {
            ctx.save();
            ctx.restore();
            let positions = new Map();
            for (let [node, object] of this.nodesObjects) {
                positions.set(node, this.positionGetter(object));
            }
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = .1;
            for (let nodeA of this.links) {
                for (let nodeB of nodeA[1]) {
                    let p1 = positions.get(nodeA[0]);
                    let p2 = positions.get(nodeB);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        return true;
    }
}
export class Node {
    cost = 0;
    heuristic = 0;
    previous = null;
    id;
    constructor(id) { this.id = id; }
}
export class Path {
    points = [];
    currentPosition = new Vector();
    currentSegment = 1;
    constructor(vectors) {
        this.points = vectors;
        this.currentPosition.copy(this.points[0]);
    }
    length() {
        let length = 0;
        for (let index = 0; index < this.points.length - 1; index++)
            length += this.points[index].distanceTo(this.points[index + 1]);
        return length;
    }
    reset() {
        this.currentPosition.copy(this.points[0]);
        this.currentSegment = 0;
    }
    end() { return this.points.length == this.currentSegment; }
    follow(length) {
        let next = this.points[this.currentSegment];
        let distance = this.currentPosition.distanceTo(next);
        while (distance <= length) {
            length -= distance;
            this.currentPosition.copy(next);
            next = this.points[++this.currentSegment];
            distance = this.currentPosition.distanceTo(next);
            if (this.currentSegment == this.points.length)
                return this.currentPosition.clone();
        }
        this.currentPosition.add(next.clone().sub(this.currentPosition).normalize().multS(length));
        return this.currentPosition.clone();
    }
}
export class PseudoRandom {
    static a = 1664525;
    static c = 1013904223;
    static m = Math.pow(2, 32);
    seed;
    a = PseudoRandom.a;
    c = PseudoRandom.c;
    m = PseudoRandom.m;
    constructor(seed = Math.random()) {
        this.seed = seed;
    }
    get() {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed / this.m;
    }
    static get(seed = Math.random()) {
        return ((PseudoRandom.a * seed + PseudoRandom.c) % PseudoRandom.m) / PseudoRandom.m;
    }
}
export class PerlinNoise {
    rng;
    seed;
    grid;
    horizontalLoop;
    verticalLoop;
    depthLoop;
    constructor(seed = Math.random(), horizontalLoop = 2048, verticalLoop = 2048, depthLoop = 2048) {
        this.seed = seed;
        this.horizontalLoop = horizontalLoop;
        this.verticalLoop = verticalLoop;
        this.depthLoop = depthLoop;
        this.rng = new PseudoRandom(seed);
        this.grid = [];
        for (let x of range(horizontalLoop)) {
            this.grid.push([]);
            for (let y of range(verticalLoop)) {
                this.grid[x].push([]);
                for (let z of range(depthLoop)) {
                    // let r = this.rng.get() * Math.PI * 2
                    let s = this.seed ^ x ^ (y * 57) ^ (z * 29);
                    let xv = Math.cos(s);
                    let yv = Math.sin(s);
                    let zv = PseudoRandom.get(s) * 2 - 1;
                    let vec = new Vector(xv, yv, zv);
                    this.grid[x][y].push(vec);
                }
            }
        }
    }
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    getVector(ix, iy, iz) {
        ix = ((ix % this.horizontalLoop) + this.horizontalLoop) % this.horizontalLoop;
        iy = ((iy % this.verticalLoop) + this.verticalLoop) % this.verticalLoop;
        iz = ((iz % this.depthLoop) + this.depthLoop) % this.depthLoop;
        let vec = this.grid[ix][iy][iz];
        return vec;
    }
    gradDotProduct(ix, iy, iz, x, y, z) {
        let distanceVector = new Vector(x - ix, y - iy, z - iz);
        let grad = this.getVector(ix, iy, iz);
        let product = distanceVector.dot(grad);
        return product;
    }
    get(x, y, z = 0) {
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;
        let z0 = Math.floor(z);
        let z1 = z0 + 1;
        let sx = this.fade(x - x0);
        let sy = this.fade(y - y0);
        let sz = this.fade(z - z0);
        let n0, n1, lpy0, lpy1, lpz0, lpz1, value;
        n0 = this.gradDotProduct(x0, y0, z0, x, y, z);
        n1 = this.gradDotProduct(x1, y0, z0, x, y, z);
        lpy0 = lerp(n0, n1, sx);
        n0 = this.gradDotProduct(x0, y1, z0, x, y, z);
        n1 = this.gradDotProduct(x1, y1, z0, x, y, z);
        lpy1 = lerp(n0, n1, sx);
        lpz0 = lerp(lpy0, lpy1, sy);
        n0 = this.gradDotProduct(x0, y0, z1, x, y, z);
        n1 = this.gradDotProduct(x1, y0, z1, x, y, z);
        lpy0 = lerp(n0, n1, sx);
        n0 = this.gradDotProduct(x0, y1, z1, x, y, z);
        n1 = this.gradDotProduct(x1, y1, z1, x, y, z);
        lpy1 = lerp(n0, n1, sx);
        lpz1 = lerp(lpy0, lpy1, sy);
        value = lerp(lpz0, lpz1, sz);
        return value;
    }
}
export function lerp(a, b, t) { return (1 - t) * a + t * b; }
export function coserp(a, b, t) {
    let t2 = (1 - Math.cos(t * Math.PI)) / 2;
    return (1 - t2) * a + t2 * b;
}
export function map(nbr, sourceMin, sourceMax, targetMin, targetMax) {
    let t = (nbr - sourceMin) / (sourceMax - sourceMin);
    let res = t * (targetMax - targetMin) + targetMin;
    return res;
}
