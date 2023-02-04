import { Vector } from "./Vector.js";
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
    getFlood(source, maxDistance = Number.MAX_SAFE_INTEGER, estimateDistance) {
        if (!this.hasNode(source))
            return null;
        let nodes = new Map();
        this.nodes.forEach(id => nodes.set(id, new Node(id)));
        let start = nodes.get(source);
        let closed = [];
        let opened = [start];
        while (opened.length) {
            // Get the nearest path
            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.cost < b.cost ? a : b)), 1)[0];
            let currentObject = this.nodesObjects.get(current.id);
            closed.push(current);
            for (let neighbour of this.links.get(current.id)) {
                let node = nodes.get(neighbour);
                if (node === start)
                    continue;
                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id));
                if (node.previous) {
                    // If the cost is same or greater, we can ignore
                    if (node.cost <= cost)
                        continue;
                    node.cost = cost;
                    node.previous = current;
                    // If it was closed, unclose it
                    if (closed.includes(node))
                        closed.splice(closed.indexOf(node), 1);
                    // Open it to update neighbors the same way
                    if (!opened.includes(node))
                        opened.push(node);
                }
                else {
                    // If cost it too great, ignore node
                    if (cost > maxDistance)
                        continue;
                    node.cost = cost;
                    // No heuristic used here
                    node.previous = current;
                    opened.push(node);
                }
            }
        }
        let paths = new Map();
        for (let closedNode of closed) {
            if (closedNode === start)
                continue;
            let list = [closedNode.id];
            let node = closedNode;
            while (node.previous) {
                node = node.previous;
                list.push(node.id);
            }
            paths.set(closedNode.id, list.reverse());
        }
        return paths;
    }
    populate(nodes) { return nodes.map(id => this.nodesObjects.get(id)); }
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
        if (this.end())
            return this.currentPosition.clone();
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
    draw(ctx) {
        ctx.lineWidth = .1;
        ctx.strokeStyle = 'lime';
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let index = 1; index < this.points.length; index++)
            ctx.lineTo(this.points[index].x, this.points[index].y);
        ctx.stroke();
    }
}
export class HexagonGraph {
    static buildGraph(HexagonGraphObjects) {
        let graph = new Graph(false, object => object.hexVector.clone().vector);
        for (let object of HexagonGraphObjects)
            graph.addNode([object.id, object]);
        for (let object of HexagonGraphObjects)
            for (let neighbor of object.hexVector.neighbors()) {
                let neighborGridHexagon = HexagonGraphObjects.find(hex => hex.hexVector.equal(neighbor));
                if (neighborGridHexagon)
                    graph.addLink({ source: object.id, target: neighborGridHexagon.id });
            }
        return graph;
    }
}
