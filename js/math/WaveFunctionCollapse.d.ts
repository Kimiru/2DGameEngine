export declare enum WFCRuleType {
    PATTERN = 0,
    CONNECTOR = 1
}
export declare class WaveFunctionCollapse {
    ruleType: WFCRuleType;
    patterns: {
        [n: number]: WFCPattern[];
    };
    connectors: {
        [n: number]: WFCConnector;
    };
    connectorsLookupTable: {
        [n: number]: [number[], number[], number[], number[]];
    };
    constructor(ruleType: WFCRuleType);
    addPattern(pattern: WFCPattern): void;
    addConnector(connector: WFCConnector): void;
    buildConnectorsLookupTable(): void;
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
