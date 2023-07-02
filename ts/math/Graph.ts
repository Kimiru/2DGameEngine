import { Block, blockposition } from "./Block.js"
import { Vector } from "./Vector.js"

export class Graph<I, T> {

    nodes: Set<I> = new Set()
    nodesObjects: Map<I, T> = new Map()
    links: Map<I, Set<I>> = new Map()

    constructor() {

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

            this.links.get(link[0])!.add(link[1])

        }

    }

    /**
     * 
     * @param {...{source:I, target:I}} links 
     */
    removeLink(...links: [I, I][]) {

        for (let link of links)
            if (this.hasLink(link[0], link[1])) {

                this.links.get(link[0])!.delete(link[1])

            }

    }

    hasLink(source: I, target: I): boolean { return this.links.has(source) && this.links.get(source)!.has(target) }

    isConnectedTo(source: I, target: I): boolean {

        if (!this.hasNode(source)) return false
        if (!this.hasNode(target)) return false

        let nodeSet: Set<I>
        let currentSet: Set<I> = new Set([source])

        do {

            nodeSet = currentSet
            currentSet = new Set(nodeSet)

            for (let node of nodeSet)
                for (let target of this.links.get(node)!.keys())
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
                for (let target of this.links.get(node)!.keys())
                    currentSet.add(target)

        } while (nodeSet.size != currentSet.size)

        return nodeSet.size == this.nodes.size

    }

    isFullyConnected(): boolean {

        for (let node of this.nodes)
            if (!this.isConnected(node)) return false

        return true

    }

    getShortestPathBetween(source: I, target: I, estimateDistance: (nodeA: T, nodeB: T) => number): I[] | null {

        if (!this.hasNode(source) || !this.hasNode(target)) return null

        let nodes: Map<I, Node<I>> = new Map()
        this.nodes.forEach(id => nodes.set(id, new Node(id)))

        let start: Node<I> = nodes.get(source)!
        let end: Node<I> = nodes.get(target)!

        let closed: Node<I>[] = []
        let opened: Node<I>[] = [start]

        while (opened.length) {

            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.heuristic < b.heuristic ? a : b)), 1)[0]!
            let currentObject = this.nodesObjects.get(current.id)!

            if (current == end) {

                let list = [end.id]
                let node = end

                while (node.previous) {

                    node = node.previous
                    list.push(node.id)

                }

                return list.reverse()

            }

            for (let neighbour of this.links.get(current.id)!) {

                let node = nodes.get(neighbour)!
                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id)!)

                if (!(closed.includes(node) || (opened.includes(node) && node.cost <= cost))) {

                    node.cost = cost
                    node.heuristic = node.cost + estimateDistance(this.nodesObjects.get(node.id)!, this.nodesObjects.get(end.id)!)
                    node.previous = current
                    opened.push(node)

                }

            }

            closed.push(current)

        }

        return null

    }

    getFlood(source: I, maxDistance: number = Number.MAX_SAFE_INTEGER, estimateDistance: (nodeA: T, nodeB: T) => number): Map<I, I[]> | null {

        if (!this.hasNode(source)) return null

        let nodes: Map<I, Node<I>> = new Map()
        this.nodes.forEach(id => nodes.set(id, new Node(id)))

        let start: Node<I> = nodes.get(source)!

        let closed: Node<I>[] = []
        let opened: Node<I>[] = [start]

        while (opened.length) {

            // Get the nearest path
            let current = opened.splice(opened.indexOf(opened.reduce((a, b) => a.cost < b.cost ? a : b)), 1)[0]!
            let currentObject = this.nodesObjects.get(current.id)!
            closed.push(current)

            for (let neighbour of this.links.get(current.id)!) {

                let node: Node<I> = nodes.get(neighbour)!

                if (node === start) continue

                let cost = current.cost + estimateDistance(currentObject, this.nodesObjects.get(node.id)!)

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

    populate(nodes: I[]): T[] { return nodes.map(id => this.nodesObjects.get(id)!) }

    clone(): Graph<I, T> {

        let graph = new Graph<I, T>()

        graph.addNode(...this.nodesObjects.entries())
        graph.addLink(...[...this.links.entries()].map(([source, targets]) => [...targets].map((target) => [source, target] as [I, I])).flat())

        return graph

    }

    static generate<DATA, ID, OBJ>(
        data: DATA[],
        dataToId: (DATA: DATA) => ID,
        dataToObj: (DATA: DATA) => OBJ,
        getIdNeighbors: (ID: ID, OBJ: OBJ) => ID[]
    ): Graph<ID, OBJ> {

        let graph: Graph<ID, OBJ> = new Graph()

        let dataEntries = data.map(dataEntry => [dataToId(dataEntry), dataToObj(dataEntry)]) as [ID, OBJ][]

        graph.addNode(...dataEntries)

        dataEntries.forEach(entry => graph.addLink(...getIdNeighbors(...entry).map(id => ([entry[0], id] as [ID, ID]))))

        return graph

    }

    static generateFromBlock<T>(block: Block<T>, linkExtractor: (position: [number, number, number], object: T) => blockposition[]): Graph<string, T> {

        return this.generate([...block.cells.entries()],
            ([index, cell]) => Block.blockPositionToId(block.indexToPosition(index)),
            ([index, cell]) => cell,
            (id, obj) => linkExtractor(Block.idToBlockPosition(id), obj).map(Block.blockPositionToId)
        )

    }

}

export class Node<I> {

    cost: number = 0
    heuristic: number = 0
    previous: Node<I> | null = null
    id: I

    constructor(id: I) { this.id = id }

}

export class Path {

    points: Vector[] = []
    currentPosition: Vector = new Vector()
    currentSegment = 1

    constructor(Vectors3: Vector[]) {

        this.points = Vectors3
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

}