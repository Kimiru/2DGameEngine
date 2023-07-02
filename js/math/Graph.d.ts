import { Block, blockposition } from "./Block.js";
import { Vector } from "./Vector.js";
export declare class Graph<I, T> {
    nodes: Set<I>;
    nodesObjects: Map<I, T>;
    links: Map<I, Set<I>>;
    constructor();
    addNode(...nodes: [I, T][]): void;
    removeNode(...nodes: I[]): void;
    /**
     *
     * @param {I} node
     * @returns {boolean}
     */
    hasNode(node: I): boolean;
    /**
     *
     * @param {...{source:I, target:I, data:any}} links
     */
    addLink(...links: [I, I][]): void;
    /**
     *
     * @param {...{source:I, target:I}} links
     */
    removeLink(...links: [I, I][]): void;
    hasLink(source: I, target: I): boolean;
    isConnectedTo(source: I, target: I): boolean;
    isConnected(node: I): boolean;
    isFullyConnected(): boolean;
    getShortestPathBetween(source: I, target: I, estimateDistance: (nodeA: T, nodeB: T) => number): I[] | null;
    getFlood(source: I, maxDistance: number | undefined, estimateDistance: (nodeA: T, nodeB: T) => number): Map<I, I[]> | null;
    populate(nodes: I[]): T[];
    clone(): Graph<I, T>;
    static generate<DATA, ID, OBJ>(data: DATA[], dataToId: (DATA: DATA) => ID, dataToObj: (DATA: DATA) => OBJ, getIdNeighbors: (ID: ID, OBJ: OBJ) => ID[]): Graph<ID, OBJ>;
    static generateFromBlock<T>(block: Block<T>, linkExtractor: (position: [number, number, number], object: T) => blockposition[]): Graph<string, T>;
}
export declare class Node<I> {
    cost: number;
    heuristic: number;
    previous: Node<I> | null;
    id: I;
    constructor(id: I);
}
export declare class Path {
    points: Vector[];
    currentPosition: Vector;
    currentSegment: number;
    constructor(Vectors3: Vector[]);
    get endPosition(): Vector;
    length(): number;
    reset(): void;
    end(): boolean;
    follow(length: number): Vector;
}
