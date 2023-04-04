import { Vector } from "./Vector.js"

const TOP = 0
const RIGHT = 1
const BOTTOM = 2
const LEFT = 3

export enum WFCRuleType {

    PATTERN, CONNECTOR

}

export class WaveFunctionCollapse {

    ruleType: WFCRuleType

    patterns: { [n: number]: WFCPattern[] }
    connectors: { [n: number]: WFCConnector }

    connectorsLookupTable: { [n: number]: [number[], number[], number[], number[]] }

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

    buildConnectorsLookupTable(): void {

        this.connectorsLookupTable = {}

        for (let [id, connector] of Object.entries(this.connectors)) {

            let lookup: [number[], number[], number[], number[]] = [[], [], [], []]

            for (let [nextid, nextconnector] of Object.entries(this.connectors))
                for (let side = 0; side < 4; side++)
                    if (connectorsConnects(connector, side, nextconnector))
                        lookup[side].push(Number(nextid))

            this.connectors[id] = lookup

        }

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

export function rotateWFCConnector(connector: WFCConnector): [WFCConnector, WFCConnector, WFCConnector, WFCConnector] {

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

function connectorTripleMatch(tripleA: WFCConnectorTriple, tripleB: WFCConnectorTriple): boolean {

    for (let indexA = 0; indexA < 3; indexA++)
        if (tripleA[indexA] !== tripleB[2 - indexA]) return false

    return true

}

function connectorsConnects(connectorA: WFCConnector, side: number, connectorB: WFCConnector): boolean {

    let otherside = (side + 2) % 4

    return connectorTripleMatch(connectorA.constraints[side], connectorB.constraints[otherside])

}