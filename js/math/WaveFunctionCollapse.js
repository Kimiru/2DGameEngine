import { range } from "../2DGameEngine.js";
import { Vector } from "./Vector.js";
const TOP = 0;
const RIGHT = 1;
const BOTTOM = 2;
const LEFT = 3;
export var WFCRuleType;
(function (WFCRuleType) {
    WFCRuleType[WFCRuleType["PATTERN"] = 0] = "PATTERN";
    WFCRuleType[WFCRuleType["CONNECTOR"] = 1] = "CONNECTOR";
})(WFCRuleType || (WFCRuleType = {}));
export class WaveFunctionCollapse {
    ruleType;
    patterns = {};
    connectors = {};
    connectorsLookupTable;
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
        if (!this.connectors[connector.id])
            this.connectors[connector.id] = [];
        this.connectors[connector.id].push(connector);
    }
    buildConnectorsLookupTable() {
        this.connectorsLookupTable = {};
        for (let [id, connectorList] of Object.entries(this.connectors)) {
            this.connectorsLookupTable[id] = [[], [], [], []];
            for (let connector of connectorList)
                for (let [nextid, nextconnectorList] of Object.entries(this.connectors))
                    for (let nextconnector of nextconnectorList)
                        for (let side = 0; side < 4; side++)
                            if (connectorsConnects(connector, side, nextconnector))
                                this.connectorsLookupTable[id][side].push(Number(nextid));
        }
    }
    getAvailableOptions() {
        if (this.ruleType === WFCRuleType.CONNECTOR) {
            return [...Object.entries(this.connectors)].map(([id]) => Number(id));
        }
        else {
            return [...Object.entries(this.patterns)].map(([id]) => Number(id));
        }
    }
    createSolution(width, height) {
        let options = this.getAvailableOptions();
        let cells = [];
        for (let i of range(width * height))
            cells.push({
                options: [...options],
                solved: options.length <= 1
            });
        return {
            size: [width, height],
            cells
        };
    }
    isSolutionComplete(solution) {
        return solution.cells.every(cell => cell.solved);
    }
    collapse(solution, x, y, idToUse) {
        let index = WFCPositionToIndex(solution, x, y);
        if (idToUse !== undefined)
            solution.cells[index].options = [idToUse];
        else
            solution.cells[index].options = [solution.cells[index].options[Math.floor(Math.random() * solution.cells[index].options.length)]];
        solution.cells[index].solved = true;
        this.#propagate(solution, x, y);
    }
    fullCollapse(solution, start) {
        if (start)
            this.collapse(solution, start.x, start.y, start.idToUse);
        while (!this.isSolutionComplete(solution)) {
            let cell = [...solution.cells].filter(cell => !cell.solved).sort((a, b) => a.options.length - b.options.length)[0];
            let index = solution.cells.indexOf(cell);
            let [x, y] = WFCIndexToPosition(solution, index);
            this.collapse(solution, x, y);
        }
    }
    #propagate(solution, x, y) {
        // insert first point into open queue
        let open = [[x, y]];
        do {
            // Sort open points per available options in ascending order
            open.sort(([xa, ya], [xb, yb]) => {
                let a = solution.cells[WFCPositionToIndex(solution, xa, ya)];
                let b = solution.cells[WFCPositionToIndex(solution, xb, yb)];
                return a.options.length - b.options.length;
            });
            // Find the list of points which have the same smallest amount of options left
            let ties = open.filter(([x, y]) => solution.cells[WFCPositionToIndex(solution, x, y)].options.length === solution.cells[WFCPositionToIndex(solution, ...open[0])].options.length);
            // Pick one
            let chosenOne = ties[Math.floor(Math.random() * ties.length)];
            open.splice(open.indexOf(chosenOne), 1);
            // Find cell
            let cell = solution.cells[WFCPositionToIndex(solution, ...chosenOne)];
            if (this.ruleType === WFCRuleType.CONNECTOR) {
                // For each side
                for (let side of [TOP, RIGHT, BOTTOM, LEFT]) {
                    let vec = sideToVec(side);
                    let nx = chosenOne[0] + vec.x;
                    let ny = chosenOne[1] + vec.y;
                    let index = WFCPositionToIndex(solution, nx, ny);
                    // If maybe neighbor is outside the solution range, skip this side
                    if (!(0 <= nx && nx < solution.size[0] && 0 <= ny && ny < solution.size[1]))
                        continue;
                    let neighbor = solution.cells[index];
                    let startLength = neighbor.options.length;
                    let nextOptions = new Set();
                    for (let option of cell.options) {
                        let lookup = this.connectorsLookupTable[option][side];
                        neighbor.options
                            .filter(opt => lookup.includes(opt))
                            .forEach(opt => nextOptions.add(opt));
                    }
                    neighbor.options = [...nextOptions];
                    let endLength = neighbor.options.length;
                    if (startLength !== endLength)
                        open.push([nx, ny]);
                    if (endLength <= 1)
                        neighbor.solved = true;
                }
            }
        } while (open.length);
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
export function rotateWFCConnector(connector) {
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
function connectorTripleMatch(tripleA, tripleB) {
    for (let indexA = 0; indexA < 3; indexA++)
        if (tripleA[indexA] !== tripleB[2 - indexA])
            return false;
    return true;
}
function connectorsConnects(connectorA, side, connectorB) {
    let otherside = (side + 2) % 4;
    return connectorTripleMatch(connectorA.constraints[side], connectorB.constraints[otherside]);
}
function sideToVec(side) {
    switch (side) {
        case TOP:
            return new Vector(0, 1);
        case RIGHT:
            return new Vector(1, 0);
        case BOTTOM:
            return new Vector(0, -1);
        case LEFT:
            return new Vector(-1, 0);
        default:
            return new Vector(0, 1);
    }
}
export function WFCIndexToPosition(solution, index) {
    return [index % solution.size[0], Math.floor(index / solution.size[0])];
}
export function WFCPositionToIndex(solution, x, y) {
    return x + y * solution.size[0];
}
export function WFCPositionInSolution(solution, x, y) {
    return 0 <= x && x < solution.size[0] && 0 <= y && y < solution.size[1];
}
