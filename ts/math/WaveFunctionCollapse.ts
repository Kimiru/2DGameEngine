
export class WaveFunctionCollapse {

    connectors: { [n: number]: WFC.Connector[] } = {}

    connectorsLookupTable: { [n: number]: [number[], number[], number[], number[]] } | null = null

    addConnector(rule: WFC.Rule): void {

        if (!this.connectors[rule.id])
            this.connectors[rule.id] = []

        this.connectors[rule.id].push(...rule.connectors)

        if (rule.allDirection) {

            for (let i = 1; i <= 3; i++)
                this.connectors[rule.id].push(...rule.connectors.map(connector => ({ side: (connector.side + i) % 4, connection: connector.connection })))

        }

    }

    buildLookupTable(): void {

        this.connectorsLookupTable = {}

        for (let [id, connectorList] of Object.entries(this.connectors)) {
            let lookup: [Set<number>, Set<number>, Set<number>, Set<number>] = [new Set(), new Set(), new Set(), new Set()]
            for (let connector of connectorList)
                for (let [nextid, nextconnectorList] of Object.entries(this.connectors)) for (let nextconnector of nextconnectorList)
                    if (WFC.areConnectionsCompatible(connector, nextconnector))
                        lookup[connector.side].add(Number(nextid))
            this.connectorsLookupTable[id] = lookup.map(e => [...e].sort((a, b) => a - b)) as [number[], number[], number[], number[]]

        }

    }

    getAvailableOptions(): number[] {

        return [...Object.entries(this.connectors)].map(([id]) => Number(id))

    }

    createSolution(width: number, height: number): WFC.Solution {

        return new WFC.Solution(width, height, this)

    }

    collapse(solution: WFC.Solution, x: number, y: number, idToUse?: number) {

        let index = solution.positionToIndex(x, y)

        if (idToUse !== undefined)
            solution.cells[index].options = [idToUse]
        else
            solution.cells[index].options = [solution.cells[index].options[Math.floor(Math.random() * solution.cells[index].options.length)]]

        solution.cells[index].solved = true

        this.propagate(solution, x, y)

    }

    fullCollapse(solution: WFC.Solution, start?: { x: number, y: number, idToUse?: number }) {
        if (start)
            this.collapse(solution, start.x, start.y, start.idToUse)
        while (!solution.solved()) {

            let cell = [...solution.cells].filter(cell => !cell.solved).sort((a, b) => a.options.length - b.options.length)[0]

            let index = solution.cells.indexOf(cell)
            let [x, y] = solution.indexToPosition(index)

            this.collapse(solution, x, y)

        }
    }

    surround(solution: WFC.Solution, id: number) {

        for (let x = 0; x < solution.width; x++) {
            this.collapse(solution, x, 0, id)
            this.collapse(solution, x, solution.height - 1, id)
        }

        for (let y = 1; y < solution.width - 1; y++) {
            this.collapse(solution, 0, y, id)
            this.collapse(solution, solution.width - 1, y, id)
        }

    }

    propagate(solution: WFC.Solution, x: number, y: number) {

        // insert first point into open queue
        let open: [number, number][] = [[x, y]]

        do {
            // Sort open points per available options in ascending order
            open.sort(([xa, ya], [xb, yb]) => {
                let a = solution.cells[solution.positionToIndex(xa, ya)]
                let b = solution.cells[solution.positionToIndex(xb, yb)]

                return a.options.length - b.options.length
            })

            // Find the list of points which have the same smallest amount of options left
            let ties = open.filter(([x, y]) => solution.cells[solution.positionToIndex(x, y)].options.length === solution.cells[solution.positionToIndex(...open[0])].options.length)

            // Pick one
            let chosenOne = ties[Math.floor(Math.random() * ties.length)]
            open.splice(open.indexOf(chosenOne), 1)

            // Find cell
            let cell = solution.cells[solution.positionToIndex(...chosenOne)]

            // For each side
            for (let side of [WFC.Side.TOP, WFC.Side.RIGHT, WFC.Side.BOTTOM, WFC.Side.LEFT]) {

                let neighborPosition = solution.neighborOf(...chosenOne, side)
                if (!neighborPosition) continue
                let [nx, ny] = neighborPosition

                let index = solution.positionToIndex(nx, ny)

                // If maybe neighbor is outside the solution range, skip this side
                if (!(0 <= nx && nx < solution.size[0] && 0 <= ny && ny < solution.size[1])) continue

                let neighbor = solution.cells[index]

                if (neighbor.solved) continue

                let startLength = neighbor.options.length

                let nextOptions: number[] = []

                for (let option of cell.options) {

                    let lookup = this.connectorsLookupTable![option][side]

                    for (let neighborOption of neighbor.options) {
                        if (lookup.includes(neighborOption))
                            nextOptions.push(neighborOption)

                    }

                }

                neighbor.options = [...new Set(nextOptions)]

                let endLength = neighbor.options.length

                if (endLength <= 1)
                    neighbor.solved = true

                if (startLength !== endLength) open.push([nx, ny])

            }

        } while (open.length)

    }

}

export namespace WFC {

    export enum Side {
        TOP = 0,
        RIGHT = 1,
        BOTTOM = 2,
        LEFT = 3
    }

    export type Connection = number[]

    export function areConnectionTripleMatching(connectionA: Connection, connectionB: Connection): boolean {

        if (connectionA.length !== connectionB.length) return false

        for (let indexA = 0; indexA < connectionA.length; indexA++)
            if (connectionA[indexA] !== connectionB[connectionA.length - 1 - indexA]) return false

        return true

    }

    export interface Connector {
        side: Side,
        connection: Connection
    }

    export function areConnectionsCompatible(connectionA: Connector, connectionB: Connector) {

        if (connectionA.side !== (connectionB.side + 2) % 4) return

        return areConnectionTripleMatching(connectionA.connection, connectionB.connection)

    }

    export interface Rule {
        id: number,
        connectors: Connector[],
        allDirection?: boolean
    }

    /**
     * Rotate the rule steps times to the right
     */
    export function rotateRule(rule: Rule, newid?: number, steps: number = 1): Rule {

        steps = ((steps % 4) + 4) % 4

        return {
            id: newid ?? rule.id,
            connectors: rule.connectors.map(connector => ({
                side: (connector.side + steps) % 4,
                connection: [...connector.connection]
            }))
        }

    }

    export function flipRule(rule: Rule, newid?: number, direction: number = -1): Rule {

        if (direction !== -1) {
            return {
                id: newid ?? rule.id,
                connectors: rule.connectors.map(connector => {
                    let flip = (connector.side & 1) === (direction & 1)
                    return {
                        side: flip ? (connector.side + 2) % 4 : connector.side,
                        connection: [...connector.connection].reverse()
                    }
                })
            }
        }

        return {
            id: newid ?? rule.id,
            connectors: rule.connectors.map(connector => ({
                side: connector.side,
                connection: [...connector.connection]
            }))
        }

    }

    export interface Cell {
        options: number[]
        solved: boolean
    }

    export class Solution {
        size: [number, number] = [1, 1]
        cells: Cell[] = []
        wfc: WaveFunctionCollapse

        constructor(width: number, height: number, wfc: WaveFunctionCollapse) {

            if (width < 1 || height < 1) throw 'Solution size cannot be less than 1x1'

            this.size = [width, height]
            this.wfc = wfc

            let options = wfc.getAvailableOptions()

            for (let index = 0; index < width * height; index++)
                this.cells.push({ options: [...options], solved: false })

        }

        get width() { return this.size[0] }
        get height() { return this.size[1] }

        solved() {

            return this.cells.every(cell => cell.solved)

        }

        getCellAtIndex(index: number): Cell { return this.cells[index] }
        getCellAtPosition(x: number, y: number): Cell | null {
            if (!this.containsPosition(x, y)) return null
            return this.cells[this.positionToIndex(x, y)] ?? null
        }

        indexToPosition(index: number): [number, number] {

            return [index % this.width, Math.floor(index / this.width)]

        }

        positionToIndex(x: number, y: number): number {

            return x + y * this.width

        }

        containsPosition(x: number, y: number): boolean {

            return 0 <= x && x < this.width && 0 <= y && y < this.height

        }

        neighborOf(x: number, y: number, side: Side) {

            switch (side) {
                case Side.TOP:
                    y++
                    break

                case Side.RIGHT:
                    x++
                    break

                case Side.BOTTOM:
                    y--
                    break
                case Side.LEFT:
                    x--
                    break

                default:
                    y++
            }

            if (this.containsPosition(x, y))
                return [x, y]

            return null

        }

        clearCellsAtPositions(positions: [number, number][]) {


            for (let [x, y] of positions)
                if (this.getCellAtPosition(x, y))
                    this.getCellAtPosition(x, y)!.solved = false

            let options = this.wfc.getAvailableOptions()
            for (let cell of this.cells) if (!cell.solved)
                cell.options = [...options]

            for (let [index, cell] of this.cells.entries()) if (cell.solved)
                this.wfc.propagate(this, ...this.indexToPosition(index))

        }

    }

}
