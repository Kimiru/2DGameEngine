import { GameObject } from "../2DGameEngine.js"
import { HexVector } from "./HexVector.js"
import { Vector } from "./Vector.js"

export class Graph<I, T> {

    nodes: Set<I> = new Set()
    nodesObjects: Map<I, T> = new Map()
    links: Map<I, Set<I>> = new Map()
    positionGetter: (object: T) => Vector = null

    constructor(positionGetter: (object: T) => Vector = null) {

        this.positionGetter = positionGetter

    }

    addNode(...nodes: [I, T][]) {

        for (let [node, object] of nodes) {

            if (!this.nodes.has(node)) {

                this.nodes.add(node)
                this.nodesObjects.set(node, object)
                this.links.set(node, new Set())

            }

        }

    }

    removeNode(...nodes: I[]) {

        for (let node of nodes)
            if (this.hasNode(node)) {

                this.nodes.delete(node)
                this.nodesObjects.delete(node)
                this.links.delete(node)

                for (let [, map] of this.links)
                    map.delete(node)

            }

    }

    /**
     * 
     * @param {I} node 
     * @returns {boolean}
     */
    hasNode(node: I) { return this.nodes.has(node) }

    /**
     * 
     * @param {...{source:I, target:I, data:any}} links 
     */
    addLink(...links: [I, I][]) {

        for (let link of links) {

            if (!this.hasNode(link[0]) || !this.hasNode(link[1])) continue

            this.links.get(link[0]).add(link[1])

        }

    }

    /**
     * 
     * @param {...{source:I, target:I}} links 
     */
    removeLink(...links: [I, I][]) {

        for (let link of links)
            if (this.hasLink(link[0], link[1])) {

                this.links.get(link[0]).delete(link[1])

            }

    }

    hasLink(source: I, target: I) { return this.links.has(source) && this.links.get(source).has(target) }

    isConnectedTo(source: I, target: I): boolean {

        if (!this.hasNode(source)) return false
        if (!this.hasNode(target)) return false

        let nodeSet: Set<I>
        let currentSet: Set<I> = new Set([source])

        do {

            nodeSet = currentSet
            currentSet = new Set(nodeSet)

            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target)

        } while (nodeSet.size != currentSet.size)

        return nodeSet.has(target)
    }

    isConnected(node: I): boolean {

        if (!this.hasNode(node)) return true

        let nodeSet: Set<I>
        let currentSet: Set<I> = new Set([node])

        do {

            nodeSet = currentSet
            currentSet = new Set(nodeSet)

            for (let node of nodeSet)
                for (let target of this.links.get(node).keys())
                    currentSet.add(target)

        } while (nodeSet.size != currentSet.size)

        return nodeSet.size == this.nodes.size

    }

    isFullyConnected(): boolean {

        for (let node of this.nodes)
            if (!this.isConnected(node)) return false

        return true

    }

    getShortestPathBetween(source: I, target: I, estimateDistance: (nodeA: T, nodeB: T) => number): I[] {

        if (!this.hasNode(source) || !this.hasNode(target)) return null

        let nodes: Map<I, Node<I>> = new Map()
        this.nodes.forEach(id => nodes.set(id, new Node(id)))

        let start = nodes.get(source)
        let end = nodes.get(target)

        let closed = []
        let opened = [start]

        while (opened.length) {

            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.heuristic < b.heuristic ? a : b)), 1)[0]
            let currentObject = this.nodesObjects.get(current.id)

            if (current == end) {

                let list = [end.id]
                let node = end

                while (node.previous) {

                    node = node.previous
                    list.push(node.id)

                }

                return list.reverse()

            }

            for (let neighbour of this.links.get(current.id)) {

                let node = nodes.get(neighbour)
                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id))

                if (!(closed.includes(node) || (opened.includes(node) && node.cost <= cost))) {

                    node.cost = cost
                    node.heuristic = node.cost + estimateDistance(this.nodesObjects.get(node.id), this.nodesObjects.get(end.id))
                    node.previous = current
                    opened.push(node)

                }

            }

            closed.push(current)

        }

        return null

    }

    getFlood(source: I, maxDistance: number = Number.MAX_SAFE_INTEGER, estimateDistance: (nodeA: T, nodeB: T) => number): Map<I, I[]> {

        if (!this.hasNode(source)) return null

        let nodes: Map<I, Node<I>> = new Map()
        this.nodes.forEach(id => nodes.set(id, new Node(id)))

        let start = nodes.get(source)

        let closed: Node<I>[] = []
        let opened: Node<I>[] = [start]

        while (opened.length) {

            // Get the nearest path
            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.cost < b.cost ? a : b)), 1)[0]
            let currentObject = this.nodesObjects.get(current.id)
            closed.push(current)

            for (let neighbour of this.links.get(current.id)) {

                let node = nodes.get(neighbour)

                if (node === start) continue

                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id))

                if (node.previous) {

                    // If the cost is same or greater, we can ignore
                    if (node.cost <= cost) continue

                    node.cost = cost
                    node.previous = current

                    // If it was closed, unclose it
                    if (closed.includes(node)) closed.splice(closed.indexOf(node), 1)

                    // Open it to update neighbors the same way
                    if (!opened.includes(node)) opened.push(node)

                } else {

                    // If cost it too great, ignore node
                    if (cost > maxDistance)
                        continue

                    node.cost = cost
                    // No heuristic used here
                    node.previous = current
                    opened.push(node)

                }

            }


        }

        let paths: Map<I, I[]> = new Map()

        for (let closedNode of closed) {

            if (closedNode === start) continue

            let list = [closedNode.id]
            let node = closedNode

            while (node.previous) {

                node = node.previous
                list.push(node.id)

            }

            paths.set(closedNode.id, list.reverse())

        }

        return paths
    }

    populate(nodes: I[]): T[] { return nodes.map(id => this.nodesObjects.get(id)) }

    draw(ctx: CanvasRenderingContext2D): boolean {

        if (this.positionGetter) {

            ctx.save()
            ctx.restore()

            let positions: Map<I, Vector> = new Map()

            for (let [node, object] of this.nodesObjects) {
                positions.set(node, this.positionGetter(object))
            }

            ctx.strokeStyle = 'blue'
            ctx.lineWidth = .1
            for (let nodeA of this.links) {

                for (let nodeB of nodeA[1]) {

                    let p1 = positions.get(nodeA[0])
                    let p2 = positions.get(nodeB)

                    ctx.beginPath()
                    ctx.moveTo(p1.x, p1.y)
                    ctx.lineTo(p2.x, p2.y)
                    ctx.stroke()

                }

            }


        }

        return true

    }

    clone(): Graph<I, T> {

        let graph = new Graph<I, T>(this.positionGetter)

        graph.addNode(...this.nodesObjects.entries())
        graph.addLink(...[...this.links.entries()].map(([source, targets]) => [...targets].map((target) => [source, target] as [I, I])).flat())

        return graph

    }

    static generate<DATA, ID, OBJ>(
        data: DATA[],
        dataToId: (DATA: DATA) => ID,
        dataToObj: (DATA: DATA) => OBJ,
        getIdNeighbors: (ID: ID, OBJ: OBJ) => ID[],
        objectToPosition?: (OBJ: OBJ) => Vector
    ): Graph<ID, OBJ> {

        let graph: Graph<ID, OBJ> = new Graph(objectToPosition)

        let dataEntries = data.map(dataEntry => [dataToId(dataEntry), dataToObj(dataEntry)]) as [ID, OBJ][]

        graph.addNode(...dataEntries)

        dataEntries.forEach(entry => graph.addLink(...getIdNeighbors(...entry).map(id => ([entry[0], id] as [ID, ID]))))

        return graph

    }

}

export class Node<I> {

    cost: number = 0
    heuristic: number = 0
    previous: Node<I> = null
    id: I

    constructor(id: I) { this.id = id }

}

export class Path {

    points: Vector[] = []
    currentPosition: Vector = new Vector()
    currentSegment = 1

    constructor(vectors: Vector[]) {

        this.points = vectors
        this.currentPosition.copy(this.points[0])

    }

    get endPosition(): Vector {

        return this.points[this.points.length - 1].clone()

    }

    length(): number {

        let length = 0

        for (let index = 0; index < this.points.length - 1; index++)
            length += this.points[index].distanceTo(this.points[index + 1])

        return length

    }

    reset() {
        this.currentPosition.copy(this.points[0])
        this.currentSegment = 0
    }

    end(): boolean { return this.points.length == this.currentSegment }

    follow(length: number): Vector {

        if (this.end()) return this.currentPosition.clone()

        let next = this.points[this.currentSegment]
        let distance = this.currentPosition.distanceTo(next)

        while (distance <= length) {

            length -= distance
            this.currentPosition.copy(next)
            next = this.points[++this.currentSegment]
            distance = this.currentPosition.distanceTo(next)
            if (this.currentSegment == this.points.length)
                return this.currentPosition.clone()

        }

        this.currentPosition.add(next.clone().sub(this.currentPosition).normalize().multS(length))

        return this.currentPosition.clone()

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.lineWidth = .1
        ctx.strokeStyle = 'lime'

        ctx.beginPath()
        ctx.moveTo(this.points[0].x, this.points[0].y)

        for (let index = 1; index < this.points.length; index++)
            ctx.lineTo(this.points[index].x, this.points[index].y)

        ctx.stroke()

    }

}


export interface HexagonGraphInterface {

    id: number
    hexVector: HexVector

}

export class HexagonGraph {

    static buildGraph<T extends HexagonGraphInterface>(HexagonGraphObjects: T[]): Graph<number, T> {

        return Graph.generate<T, number, T>(
            HexagonGraphObjects,
            data => data.id,
            data => data,
            (id, object) => object.hexVector.neighbors().map(neighbor => HexagonGraphObjects.find(object => object.hexVector.equal(neighbor))).filter(value => value).map(neighbor => neighbor.id),
            object => object.hexVector.clone().vector
        )

    }

}

export class SquareGraph {

    static buildGraph<T extends GameObject>(gameObjects: T[], includeDiagonals: boolean = false): Graph<number, T> {
        let graph = new Graph<number, T>(object => object.transform.translation.clone())

        for (let object of gameObjects)
            graph.addNode([object.id, object])

        for (let object of gameObjects)
            for (let neighbor of object.transform.translation.neighbors(includeDiagonals)) {
                let neighborObject = gameObjects.find(obj => obj.transform.translation.equal(neighbor))
                if (neighborObject)
                    graph.addLink([object.id, neighborObject.id])
            }

        return graph

    }

}