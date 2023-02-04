import { HexVector } from "./HexVector.js";
import { Vector } from "./Vector.js";
export declare class Graph<T> {
    nodes: Set<number>;
    nodesObjects: Map<number, T>;
    links: Map<number, Set<number>>;
    display: boolean;
    positionGetter: (object: T) => Vector;
    constructor(display?: boolean, positionGetter?: (object: T) => Vector);
    /**
     *
     * @param {...number} nodes
     */
    addNode(...nodes: [number, T][]): void;
    /**
     *
     * @param {...number} nodes
     */
    removeNode(...nodes: number[]): void;
    /**
     *
     * @param {number} node
     * @returns {boolean}
     */
    hasNode(node: number): boolean;
    /**
     *
     * @param {...{source:number, target:number, data:any}} links
     */
    addLink(...links: {
        source: number;
        target: number;
    }[]): void;
    /**
     *
     * @param {...{source:number, target:number}} links
     */
    removeLink(...links: {
        source: number;
        target: number;
    }[]): void;
    hasLink(source: number, target: number): boolean;
    isConnectedTo(source: number, target: number): boolean;
    isConnected(node: number): boolean;
    isFullyConnected(): boolean;
    getShortestPathBetween(source: number, target: number, estimateDistance: (nodeA: T, nodeB: T) => number): number[];
    getFlood(source: number, maxDistance: number, estimateDistance: (nodeA: T, nodeB: T) => number): Map<number, number[]>;
    populate(nodes: number[]): T[];
    draw(ctx: CanvasRenderingContext2D): boolean;
}
export declare class Node {
    cost: number;
    heuristic: number;
    previous: Node;
    id: number;
    constructor(id: number);
}
export declare class Path {
    points: Vector[];
    currentPosition: Vector;
    currentSegment: number;
    constructor(vectors: Vector[]);
    length(): number;
    reset(): void;
    end(): boolean;
    follow(length: number): Vector;
    draw(ctx: CanvasRenderingContext2D): void;
}
export interface HexagonGraphInterface {
    id: number;
    hexVector: HexVector;
}
export declare class HexagonGraph {
    static buildGraph<T extends HexagonGraphInterface>(HexagonGraphObjects: T[]): Graph<T>;
}
