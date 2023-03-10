import { GameObject } from "../2DGameEngine.js";
import { HexVector } from "./HexVector.js";
import { Vector } from "./Vector.js";
export declare class Graph<I, T> {
    nodes: Set<I>;
    nodesObjects: Map<I, T>;
    links: Map<I, Set<I>>;
    display: boolean;
    positionGetter: (object: T) => Vector;
    constructor(display?: boolean, positionGetter?: (object: T) => Vector);
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
    addLink(...links: {
        source: I;
        target: I;
    }[]): void;
    /**
     *
     * @param {...{source:I, target:I}} links
     */
    removeLink(...links: {
        source: I;
        target: I;
    }[]): void;
    hasLink(source: I, target: I): boolean;
    isConnectedTo(source: I, target: I): boolean;
    isConnected(node: I): boolean;
    isFullyConnected(): boolean;
    getShortestPathBetween(source: I, target: I, estimateDistance: (nodeA: T, nodeB: T) => number): I[];
    getFlood(source: I, maxDistance: number, estimateDistance: (nodeA: T, nodeB: T) => number): Map<I, I[]>;
    populate(nodes: I[]): T[];
    draw(ctx: CanvasRenderingContext2D): boolean;
    clone(): Graph<I, T>;
    static generate<DATA, ID, OBJ>(data: DATA[], dataToId: (DATA: DATA) => ID, dataToObj: (DATA: DATA) => OBJ, getIdNeighbors: (ID: ID, OBJ: OBJ) => ID[], objectToPosition?: (OBJ: OBJ) => Vector): Graph<ID, OBJ>;
}
export declare class Node<I> {
    cost: number;
    heuristic: number;
    previous: Node<I>;
    id: I;
    constructor(id: I);
}
export declare class Path {
    points: Vector[];
    currentPosition: Vector;
    currentSegment: number;
    constructor(vectors: Vector[]);
    get endPosition(): Vector;
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
    static buildGraph<T extends HexagonGraphInterface>(HexagonGraphObjects: T[]): Graph<number, T>;
}
export declare class SquareGraph {
    static buildGraph<T extends GameObject>(gameObjects: T[], includeDiagonals?: boolean): Graph<number, T>;
}
