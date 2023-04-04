import { Vector } from "./Vector.js"

export enum WFCRuleType {

    PATTERN, CONNECTOR

}

export class WaveFunctionCollapse {

    ruleType: WFCRuleType

    patterns: { [n: number]: WFCPattern[] }
    connectors: { [number: number]: WFCConnector }

    constructor(ruleType: WFCRuleType) {

        this.ruleType = ruleType

    }

    addPattern(pattern: WFCPattern): void {

        if (this.ruleType === WFCRuleType.CONNECTOR) throw 'Cannot add a pattern with ruleType CONNECTOR'

        if (!this.patterns[pattern.id]) this.patterns[pattern.id] = []

        if (pattern.rotate)
            this.patterns[pattern.id].push(...rotateWFCPattern(pattern))
        else
            this.patterns[pattern.id].push(pattern)

    }

    addConnector(connector: WFCConnector): void {

        if (this.ruleType === WFCRuleType.PATTERN) throw 'Cannot add a pattern with ruleType PATTERN'

        if (this.connectors[connector.id]) throw `A connector for id "${connector.id}" already exists.`

        this.connectors[connector.id] = connector

    }

}

export interface WFCRule {
    id: number,
    rotate: boolean
}

export interface WFCPattern extends WFCRule {

    constraints: {
        x: number,
        y: number,
        id: number
    }[]

}

export type WFCConnectorTriple = [number, number, number]
export type WFCConnectorConstraints = [WFCConnectorTriple, WFCConnectorTriple, WFCConnectorTriple, WFCConnectorTriple]

export interface WFCConnector extends WFCRule {

    constraints: WFCConnectorConstraints

}

function rotateWFCPattern(pattern: WFCPattern): [WFCPattern, WFCPattern, WFCPattern, WFCPattern] {

    let patterns: [WFCPattern, WFCPattern, WFCPattern, WFCPattern] = [
        pattern,
        { id: pattern.id, rotate: true, constraints: [] },
        { id: pattern.id, rotate: true, constraints: [] },
        { id: pattern.id, rotate: true, constraints: [] }
    ]


    for (let { x, y, id } of pattern.constraints)
        for (let i = 1; i <= 3; i++) {

            let pos = new Vector(x, y).rotate(Math.PI / 2 * i).round()

            let newcontstraint = {
                x: pos.x,
                y: pos.y,
                id
            }

            patterns[i].constraints.push(newcontstraint)

        }

    return patterns

}

function rotateWFCConnector(connector: WFCConnector): [WFCConnector, WFCConnector, WFCConnector, WFCConnector] {

    let connectors: [WFCConnector, WFCConnector, WFCConnector, WFCConnector] = [
        connector,
        { id: connector.id, rotate: true, constraints: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        { id: connector.id, rotate: true, constraints: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] },
        { id: connector.id, rotate: true, constraints: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]] }
    ]

    let constraints: WFCConnectorConstraints = [...connector.constraints]
    for (let i = 1; i <= 3; i++) {
        constraints.push(constraints.shift())
        connectors[i].constraints = [...constraints]
    }

    return connectors

}