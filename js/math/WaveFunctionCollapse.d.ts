export declare class WaveFunctionCollapse {
    connectors: {
        [n: number]: WFC.Connector[];
    };
    connectorsLookupTable: {
        [n: number]: [number[], number[], number[], number[]];
    } | null;
    addConnector(rule: WFC.Rule): void;
    buildLookupTable(): void;
    getAvailableOptions(): number[];
    createSolution(width: number, height: number): WFC.Solution;
    collapse(solution: WFC.Solution, x: number, y: number, idToUse?: number): void;
    fullCollapse(solution: WFC.Solution, start?: {
        x: number;
        y: number;
        idToUse?: number;
    }): void;
    surround(solution: WFC.Solution, id: number): void;
    propagate(solution: WFC.Solution, x: number, y: number): void;
}
export declare namespace WFC {
    enum Side {
        TOP = 0,
        RIGHT = 1,
        BOTTOM = 2,
        LEFT = 3
    }
    type Connection = number[];
    function areConnectionTripleMatching(connectionA: Connection, connectionB: Connection): boolean;
    interface Connector {
        side: Side;
        connection: Connection;
    }
    function areConnectionsCompatible(connectionA: Connector, connectionB: Connector): boolean | undefined;
    interface Rule {
        id: number;
        connectors: Connector[];
        allDirection?: boolean;
    }
    /**
     * Rotate the rule steps times to the right
     */
    function rotateRule(rule: Rule, newid?: number, steps?: number): Rule;
    function flipRule(rule: Rule, newid?: number, direction?: number): Rule;
    interface Cell {
        options: number[];
        solved: boolean;
    }
    class Solution {
        size: [number, number];
        cells: Cell[];
        wfc: WaveFunctionCollapse;
        constructor(width: number, height: number, wfc: WaveFunctionCollapse);
        get width(): number;
        get height(): number;
        solved(): boolean;
        getCellAtIndex(index: number): Cell;
        getCellAtPosition(x: number, y: number): Cell | null;
        indexToPosition(index: number): [number, number];
        positionToIndex(x: number, y: number): number;
        containsPosition(x: number, y: number): boolean;
        neighborOf(x: number, y: number, side: Side): number[] | null;
        clearCellsAtPositions(positions: [number, number][]): void;
    }
}
