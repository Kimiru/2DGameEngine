import { Vector } from "./Vector.js";
export var WFCRuleType;
(function (WFCRuleType) {
    WFCRuleType[WFCRuleType["PATTERN"] = 0] = "PATTERN";
    WFCRuleType[WFCRuleType["CONNECTOR"] = 1] = "CONNECTOR";
})(WFCRuleType || (WFCRuleType = {}));
export class WaveFunctionCollapse {
    ruleType;
    patterns;
    connectors;
    constructor(ruleType) {
        this.ruleType = ruleType;
    }
    addPattern(pattern) {
        if (this.ruleType === WFCRuleType.CONNECTOR)
            throw 'Cannot add a pattern with ruleType CONNECTOR';
        if (!this.patterns[pattern.id])
            this.patterns[pattern.id] = [];
        if (pattern.rotate)
            this.patterns[pattern.id].push(...rotateWFCPattern(pattern));
        else
            this.patterns[pattern.id].push(pattern);
    }
    addConnector(connector) {
        if (this.ruleType === WFCRuleType.PATTERN)
            throw 'Cannot add a pattern with ruleType PATTERN';
        if (this.connectors[connector.id])
            throw `A connector for id "${connector.id}" already exists.`;
        this.connectors[connector.id] = connector;
    }
}
function rotateWFCPattern(pattern) {
    let patterns = [
        pattern,
        { id: pattern.id, rotate: true, constraints: [] },
        { id: pattern.id, rotate: true, constraints: [] },
        { id: pattern.id, rotate: true, constraints: [] }
    ];
    for (let { x, y, id } of pattern.constraints)
        for (let i = 1; i <= 3; i++) {
            let pos = new Vector(x, y).rotate(Math.PI / 2 * i).round();
            let newcontstraint = {
                x: pos.x,
                y: pos.y,
                id
            };
            patterns[i].constraints.push(newcontstraint);
        }
    return patterns;
}
function rotateWFCConnector(connector) {
    let connectors = [
        connector,
        { id: connector.id, rotate: true, constraints: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        { id: connector.id, rotate: true, constraints: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        { id: connector.id, rotate: true, constraints: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] }
    ];
    let constraints = [...connector.constraints];
    for (let i = 1; i <= 3; i++) {
        constraints.push(constraints.shift());
        connectors[i].constraints = [...constraints];
    }
    return connectors;
}
