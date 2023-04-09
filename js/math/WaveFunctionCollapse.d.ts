export declare enum WFCRuleType {
    PATTERN = 0,
    CONNECTOR = 1
}
export declare class WaveFunctionCollapse {
    #private;
    ruleType: WFCRuleType;
    patterns: {
        [n: number]: WFCPattern[];
    };
    connectors: {
        [n: number]: WFCConnector[];
    };
    connectorsLookupTable: {
        [n: number]: [number[], number[], number[], number[]];
    };
    constructor(ruleType: WFCRuleType);
    addPattern(pattern: WFCPattern): void;
    addConnector(connector: WFCConnector): void;
    buildConnectorsLookupTable(): void;
    getAvailableOptions(): number[];
    createSolution(width: number, height: number): WFCSolution;
    isSolutionComplete(solution: WFCSolution): boolean;
    collapse(solution: WFCSolution, x: number, y: number, idToUse?: number): void;
    fullCollapse(solution: WFCSolution, start?: {
        x: number;
        y: number;
        idToUse?: number;
    }): void;
}
export interface WFCCell {
    options: number[];
    solved: boolean;
}
export interface WFCSolution {
    size: [number, number];
    cells: WFCCell[];
}
export interface WFCRule {
    id: number;
    rotate: boolean;
}
export interface WFCPattern extends WFCRule {
    constraints: {
        x: number;
        y: number;
        id: number;
    }[];
}
export type WFCConnectorTriple = [number, number, number];
export type WFCConnectorConstraints = [WFCConnectorTriple, WFCConnectorTriple, WFCConnectorTriple, WFCConnectorTriple];
export interface WFCConnector extends WFCRule {
    constraints: WFCConnectorConstraints;
}
export declare function rotateWFCConnector(connector: WFCConnector): [WFCConnector, WFCConnector, WFCConnector, WFCConnector];
export declare function WFCIndexToPosition(solution: WFCSolution, index: number): [number, number];
export declare function WFCPositionToIndex(solution: WFCSolution, x: number, y: number): number;
export declare function WFCPositionInSolution(solution: WFCSolution, x: number, y: number): boolean;
