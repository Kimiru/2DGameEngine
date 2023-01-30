import { GameObject } from "./2DGameEngine.js";
import { HexOrientation, HexVector, TransformMatrix, Vector } from "./2DGEMath.js";
// see https://github.com/tcql/greiner-hormann
class Vertex extends Vector {
    alpha = 0.0;
    intersect = false;
    entry = true;
    checked = false;
    degenerate = false;
    neighbor = null;
    next = null;
    prev = null;
    type = null;
    remove = false;
    constructor(x, y, alpha = 0, intersect = false, degenerate = false) {
        super(x, y);
        this.alpha = alpha;
        this.intersect = intersect;
        this.degenerate = degenerate;
    }
    setTypeUsing(polygon) {
        if (this.type)
            return;
        this.type = polygon.containsVector(this) ? 'in' : 'out';
    }
    pairing() {
        return `${this.prev.type}/${this.next.type}`;
    }
    entryPairing = function () {
        var entry = this.entry ? 'en' : 'ex';
        var neightborEntry = this.neighbor.entry ? 'en' : 'ex';
        return `${entry}/${neightborEntry}`;
    };
}
class Ring {
    first = null;
    constructor(coordinates) {
        if (!Polygon.isClockwise(coordinates))
            coordinates = [...coordinates].reverse();
        for (let coordinate of coordinates)
            this.push(new Vertex(coordinate.x, coordinate.y));
    }
    push(vertex) {
        if (!this.first) {
            this.first = vertex;
            this.first.prev = vertex;
            this.first.next = vertex;
        }
        else {
            let next = this.first;
            let prev = next.prev;
            next.prev = vertex;
            vertex.next = next;
            vertex.prev = prev;
            prev.next = vertex;
        }
    }
    insert(vertex, start, end) {
        let currentVertex = start.next;
        while (currentVertex !== end && currentVertex.alpha < vertex.alpha)
            currentVertex = currentVertex.next;
        vertex.next = currentVertex;
        let prev = currentVertex.prev;
        vertex.prev = prev;
        prev.next = vertex;
        currentVertex.prev = vertex;
    }
    nextNonIntersectVertex(start) {
        var currentVertex = start;
        do
            currentVertex = currentVertex.next;
        while (currentVertex.intersect && currentVertex !== start);
        return currentVertex;
    }
    firstIntersectVertexfunction() {
        var currentVertex = this.first;
        while (true) {
            if (currentVertex.intersect && !currentVertex.checked)
                return currentVertex;
            currentVertex = currentVertex.next;
            if (currentVertex === this.first)
                break;
        }
    }
    firstIntersect() {
        var currentVertex = this.first;
        do {
            if (currentVertex.intersect && !currentVertex.checked)
                return currentVertex;
            currentVertex = currentVertex.next;
        } while (currentVertex !== this.first);
    }
    count(predicate = () => true) {
        let currentVertex = this.first;
        let count = 0;
        do {
            if (predicate(currentVertex))
                count++;
            currentVertex = currentVertex.next;
        } while (currentVertex !== this.first);
        return count;
    }
    toArray() {
        let currentVertex = this.first;
        let array = [];
        do {
            array.push(currentVertex);
            currentVertex = currentVertex.next;
        } while (currentVertex !== this.first);
        return array;
    }
}
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
        this.addTag('polygon');
        this.outer = outer;
        this.inners = inners;
    }
    static isClockwise(vectors) {
        let sum = 0;
        for (let index_0 = 0; index_0 < vectors.length; index_0++) {
            let index_1 = (index_0 + 1) % vectors.length;
            let vec_0 = vectors[index_0];
            let vec_1 = vectors[index_1];
            sum += ((vec_1.x - vec_0.x) * (vec_1.y + vec_0.y));
        }
        return sum > 0;
    }
    getOuter(index) {
        return this.outer[index % this.outer.length];
    }
    hasInners() {
        return this.inners.length !== 0;
    }
    popInners() {
        let polygons = this.inners.map(inner => new Polygon(inner));
        this.inners = [];
        return polygons;
    }
    clone() {
        return new Polygon([...this.outer], ...this.inners.map(inner => inner.map(vec => vec.clone())));
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
        ctx.lineWidth = .1;
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
    // clipping operation
    static GreinerHormann(subject, clipper, subjectForward, clipperForward) {
        if (subject.hasInners() || clipper.hasInners()) {
            subject = subject.clone();
            let subjectInners = subject.popInners();
            clipper = clipper.clone();
            let clipperInners = clipper.popInners();
            let resultingPolygons = this.GreinerHormann(subject, clipper, subjectForward, clipperForward);
            let subjectInnersClipped = subjectInners.map(polygon => this.GreinerHormann(polygon, clipper, subjectForward, clipperForward)).flat();
            let clipperInnersClipped = clipperInners.map(polygon => this.GreinerHormann(polygon, subject, subjectForward, clipperForward)).flat();
            if (resultingPolygons.length === 1) {
                resultingPolygons[0].inners.push(...subjectInnersClipped.map(poly => [...poly.outer]), ...clipperInnersClipped.map(poly => [...poly.outer]));
            }
            return resultingPolygons;
        }
        let subjectRing = new Ring(subject.outer);
        let clipperRing = new Ring(clipper.outer);
        this.#computeInterections(subjectRing, clipperRing, subject, clipper);
        this.#markDegeneratesAsIntersections(subjectRing);
        let result = this.#checkQuitCases(subjectRing, clipperRing, subject, clipper, this.#getMode(subjectForward, clipperForward));
        if (result)
            return result;
        this.#setEntryVertexAndExitVertex(subjectRing);
        return this.#buildPolygons(subjectRing, subjectForward, clipperForward);
    }
    static #getMode(subjectForward, clipperForward) {
        if (subjectForward)
            if (clipperForward)
                return 'intersect';
            else
                return 'substractA';
        else if (clipperForward)
            return 'substractB';
        else
            return 'union';
    }
    static #computeInterections(subjectRing, clipperRing, subject, clipper) {
        let subjectCurrentVertex = subjectRing.first;
        do {
            subjectCurrentVertex.setTypeUsing(clipper);
            let clipperCurrentVertex = clipperRing.first;
            if (!subjectCurrentVertex.intersect)
                do {
                    clipperCurrentVertex.setTypeUsing(subject);
                    if (!clipperCurrentVertex.intersect) {
                        let subjectSegmentEnd = subjectRing.nextNonIntersectVertex(subjectCurrentVertex);
                        let clipperSegmentEnd = clipperRing.nextNonIntersectVertex(clipperCurrentVertex);
                        let subjectSegment = new Segment(subjectCurrentVertex, subjectSegmentEnd);
                        let clipperSegment = new Segment(clipperCurrentVertex, clipperSegmentEnd);
                        let intersectionVector = subjectSegment.intersect(clipperSegment);
                        if (intersectionVector) {
                            let subjectAlpha = subjectCurrentVertex.distanceTo(intersectionVector) / subjectSegment.length();
                            let clipperAlpha = clipperCurrentVertex.distanceTo(intersectionVector) / clipperSegment.length();
                            clipperCurrentVertex = this.#handleIntersection(subjectRing, clipperRing, subjectCurrentVertex, subjectSegmentEnd, clipperCurrentVertex, clipperSegmentEnd, intersectionVector, subjectAlpha, clipperAlpha);
                        }
                    }
                    clipperCurrentVertex = clipperCurrentVertex.next;
                } while (clipperCurrentVertex !== clipperRing.first);
            subjectCurrentVertex = subjectCurrentVertex.next;
        } while (subjectCurrentVertex !== subjectRing.first);
    }
    static #handleIntersection(subjectRing, clipperRing, subjectSegmentStart, subjectSegmentEnd, clipperSegmentStart, clipperSegmentEnd, intersectionVector, subjectAlpha, clipperAlpha) {
        let subjectBetween = 0 < subjectAlpha && subjectAlpha < 1;
        let clipperBetween = 0 < clipperAlpha && clipperAlpha < 1;
        let subjectVertex, clipperVertex;
        // If all is fine
        if (subjectBetween && clipperBetween) {
            // Insert vertex into rings
            subjectVertex = new Vertex(intersectionVector.x, intersectionVector.y, subjectAlpha, true);
            subjectRing.insert(subjectVertex, subjectSegmentStart, subjectSegmentEnd);
            clipperVertex = new Vertex(intersectionVector.x, intersectionVector.y, clipperAlpha, true);
            clipperRing.insert(clipperVertex, clipperSegmentStart, clipperSegmentEnd);
        }
        else {
            // Handle bad stuff
            if (subjectBetween) {
                subjectVertex = new Vertex(intersectionVector.x, intersectionVector.y, subjectAlpha, true, true);
                subjectRing.insert(new Vertex(intersectionVector.x, intersectionVector.y, subjectAlpha, true), subjectSegmentStart, subjectSegmentEnd);
            }
            else if (subjectAlpha === 0) {
                subjectSegmentStart.intersect = true;
                subjectSegmentStart.degenerate = true;
                subjectSegmentStart.alpha = subjectAlpha;
                subjectVertex = subjectSegmentStart;
            }
            else if (subjectAlpha === 1) {
                subjectSegmentEnd.intersect = false;
                subjectSegmentEnd.degenerate = true;
                subjectSegmentEnd.alpha = subjectAlpha;
                subjectVertex = subjectSegmentEnd;
            }
            if (clipperBetween) {
                clipperVertex = new Vertex(intersectionVector.x, intersectionVector.y, clipperAlpha, true, true);
                clipperRing.insert(new Vertex(intersectionVector.x, intersectionVector.y, clipperAlpha, true), clipperSegmentStart, clipperSegmentEnd);
            }
            else if (clipperAlpha === 0) {
                clipperSegmentStart.intersect = true;
                clipperSegmentStart.degenerate = true;
                clipperSegmentStart.alpha = clipperAlpha;
                clipperVertex = clipperSegmentStart;
            }
            else if (clipperAlpha === 1) {
                clipperSegmentEnd.intersect = false;
                clipperSegmentEnd.degenerate = true;
                clipperSegmentEnd.alpha = clipperAlpha;
                clipperVertex = clipperSegmentEnd;
                if (clipperSegmentStart.next !== clipperRing.first)
                    clipperSegmentStart = clipperSegmentStart.next;
            }
        }
        if (!subjectVertex.intersect)
            clipperVertex.intersect = false;
        if (!clipperVertex.intersect)
            subjectVertex.intersect = false;
        if (subjectVertex && clipperVertex) {
            subjectVertex.neighbor = clipperVertex;
            clipperVertex.neighbor = subjectVertex;
            subjectVertex.type = clipperVertex.type = 'on';
        }
        return clipperSegmentStart;
    }
    static #markDegeneratesAsIntersections(ring) {
        let currentVertex = ring.first;
        do {
            if (currentVertex.degenerate)
                currentVertex.intersect = true;
            currentVertex = currentVertex.next;
        } while (currentVertex !== ring.first);
    }
    static #checkQuitCases(subjectRing, clipperRing, subject, clipper, mode) {
        let subjectVertexCount = subjectRing.count();
        let clipperVertexCount = clipperRing.count();
        // If no intersection
        if (subjectRing.count(v => v.intersect) === 0) {
            if (mode === 'union') {
                if (subjectRing.count(v => v.type === 'in') === subjectVertexCount)
                    return [clipper.clone()];
                else if (clipperRing.count(v => v.type === 'in') === clipperVertexCount)
                    return [subject.clone()];
                let polygone = subject.clone();
                polygone.inners.push([...clipper.outer].reverse());
                return [polygone];
            }
            else if (mode === 'intersect')
                return [];
            else if (mode === 'subtractB') {
                if (clipperRing.first.type === 'in') {
                    let polygone = subject.clone();
                    polygone.inners.push([...clipper.outer].reverse());
                    return [polygone];
                }
                else if (subjectRing.count(v => v.type === 'in'))
                    return [];
                return [subject.clone()];
            }
            else if (mode === 'subtractA') {
                if (subjectRing.first.type === 'in') {
                    let polygone = clipper.clone();
                    polygone.inners.push([...subject.outer].reverse());
                    return [polygone];
                }
                else if (clipperRing.count(v => v.type === 'in'))
                    return [];
                return [clipper.clone()];
            }
        }
        if (subjectRing.count(v => v.degenerate) === subjectVertexCount && subjectRing.count(v => v.intersect) === 1) {
            if (mode === 'subtractA') {
                if (clipperRing.count(v => v.degenerate) === clipperVertexCount)
                    return [];
                return [clipper.clone()];
            }
            else if (mode === 'substractB') {
                if (clipperRing.count(v => v.degenerate) === clipperVertexCount)
                    return [];
                return [subject.clone()];
            }
            return [subject.clone()];
        }
    }
    static #setEntryVertexAndExitVertex(ring) {
        let currentVertex = ring.first;
        do {
            if (currentVertex.intersect && currentVertex.neighbor) {
                this.#handleEntryExitVertex(currentVertex);
                this.#handleEntryExitVertex(currentVertex.neighbor);
                switch (currentVertex.entryPairing()) {
                    case 'en/en':
                        currentVertex.remove = true;
                        currentVertex.type = 'in';
                        currentVertex.neighbor.type = 'in';
                        currentVertex.intersect = false;
                        currentVertex.neighbor.intersect = false;
                        break;
                    case 'ex/ex':
                        currentVertex.remove = true;
                        currentVertex.type = 'out';
                        currentVertex.neighbor.type = 'out';
                        currentVertex.intersect = false;
                        currentVertex.neighbor.intersect = false;
                        break;
                }
            }
            currentVertex = currentVertex.next;
        } while (currentVertex !== ring.first);
    }
    static #handleEntryExitVertex(vertex) {
        let pairing = vertex.pairing();
        switch (pairing) {
            case 'in/out':
            case 'on/out':
            case 'in/on':
                vertex.entry = false;
                break;
            case 'out/in':
            case 'on/in':
            case 'out/on':
                vertex.entry = true;
                break;
            case 'out/out':
            case 'in/in':
            case 'on/on':
                let neighborPairing = vertex.neighbor.pairing();
                if (neighborPairing === 'out/out' || neighborPairing === 'in/in' || neighborPairing === 'on/on' || (pairing === 'on/on' && neighborPairing === 'on/out' && vertex.degenerate)) {
                    vertex.remove = true;
                    vertex.neighbor.remove = true;
                    vertex.neighbor.intersect = false;
                    vertex.intersect = false;
                }
                else {
                    this.#handleEntryExitVertex(vertex.neighbor);
                    vertex.entry = !vertex.neighbor.entry;
                }
                break;
            default:
                console.error('UNKNOWN TYPE', vertex.pairing());
        }
    }
    static #buildPolygons(ring, subjectForward, clipperForward) {
        let currentVertex = ring.first;
        let polygonList = [];
        let onClip = false;
        let entryDir = 'next';
        let exitDir = 'prev';
        while ((currentVertex = ring.firstIntersect())) {
            let poly = [new Vector(currentVertex.x, currentVertex.y)];
            do {
                if (onClip) {
                    entryDir = clipperForward ? 'next' : 'prev';
                    exitDir = clipperForward ? 'prev' : 'next';
                }
                else {
                    entryDir = subjectForward ? 'next' : 'prev';
                    exitDir = subjectForward ? 'prev' : 'next';
                }
                currentVertex.checked = true;
                if (currentVertex.neighbor)
                    currentVertex.neighbor.checked = true;
                if (currentVertex.entry)
                    do {
                        currentVertex = currentVertex[entryDir];
                        poly.push(new Vector(currentVertex.x, currentVertex.y));
                    } while (!currentVertex.intersect);
                else
                    do {
                        currentVertex = currentVertex[exitDir];
                        poly.push(new Vector(currentVertex.x, currentVertex.y));
                    } while (!currentVertex.intersect);
                currentVertex = currentVertex.neighbor;
                onClip = !onClip;
            } while (!currentVertex.checked);
            let polygon = new Polygon(poly);
            polygonList.push({ poly: polygon, isHole: false });
        }
        let graph = new Map();
        for (let polygon of polygonList) {
            if (!graph.has(polygon))
                graph.set(polygon, []);
            for (let subPolygon of polygonList) {
                if (polygon === subPolygon)
                    continue;
                if (polygon.poly.containsVector(subPolygon.poly.outer[0])) {
                    graph.get(polygon).push(subPolygon);
                    subPolygon.isHole = true;
                }
            }
        }
        let result = [];
        for (let entry of graph.entries()) {
            if (entry[0].isHole)
                continue;
            let polygon = entry[0].poly;
            for (let subPolygon of entry[1])
                polygon.inners.push([...subPolygon.poly.outer].reverse());
            result.push(polygon);
        }
        return result;
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
export class Hexagon extends Polygon {
    unit;
    orientation;
    display = false;
    color = 'red';
    constructor(position = new Vector(), orientation = HexOrientation.pointy, unit = 1) {
        super();
        this.addTag('hexagon');
        this.transform.translation.copy(position);
        this.unit = unit;
        this.orientation = orientation;
    }
    getLinear() {
        let points = [];
        let angleOffset = this.orientation === HexOrientation.pointy ? Math.PI / 6 : 0;
        let radius = this.unit;
        for (let i = 0; i < 6; i++) {
            let angle = Math.PI / 3 * i + angleOffset;
            points.push(new Vector(Math.cos(angle) * radius, Math.sin(angle) * radius));
        }
        return points;
    }
    static ctxPath(ctx, orientation, unit) {
        let angleOffset = orientation === HexOrientation.pointy ? Math.PI / 6 : 0;
        ctx.moveTo(Math.cos(angleOffset) * unit, Math.sin(angleOffset) * unit);
        for (let i = 1; i < 7; i++) {
            let angle = Math.PI / 3 * i + angleOffset;
            ctx.lineTo(Math.cos(angle) * unit, Math.sin(angle) * unit);
        }
        ctx.closePath();
    }
    ctxPath(ctx) {
        Hexagon.ctxPath(ctx, this.orientation, this.unit);
    }
    draw(ctx) {
        if (!this.display)
            return;
        ctx.lineWidth = .1;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        this.ctxPath(ctx);
        ctx.stroke();
    }
}
export class GridHexagon extends Hexagon {
    hexVector;
    constructor(hexVector = new HexVector()) {
        super(undefined, hexVector.orientation, hexVector.unit);
        this.hexVector = hexVector.clone();
        this.hexVector.vector = this.transform.translation;
        this.hexVector.updateVector();
    }
    getLinear() {
        this.orientation = this.hexVector.orientation;
        this.unit = this.hexVector.unit;
        return super.getLinear();
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
