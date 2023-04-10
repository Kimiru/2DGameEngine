export class WaveFunctionCollapse {
    connectors = {};
    connectorsLookupTable = null;
    addConnector(rule) {
        if (!this.connectors[rule.id])
            this.connectors[rule.id] = [];
        this.connectors[rule.id].push(...rule.connectors);
        if (rule.allDirection) {
            for (let i = 1; i <= 3; i++)
                this.connectors[rule.id].push(...rule.connectors.map(connector => ({ side: (connector.side + i) % 4, connection: connector.connection })));
        }
    }
    buildLookupTable() {
        this.connectorsLookupTable = {};
        for (let [id, connectorList] of Object.entries(this.connectors)) {
            this.connectorsLookupTable[id] = [[], [], [], []];
            for (let connector of connectorList)
                for (let [nextid, nextconnectorList] of Object.entries(this.connectors))
                    for (let nextconnector of nextconnectorList)
                        if (WFC.areConnectionsCompatible(connector, nextconnector))
                            this.connectorsLookupTable[id][connector.side].push(Number(nextid));
        }
    }
    getAvailableOptions() {
        return [...Object.entries(this.connectors)].map(([id]) => Number(id));
    }
    createSolution(width, height) {
        return new WFC.Solution(width, height, this);
    }
    collapse(solution, x, y, idToUse) {
        let index = solution.positionToIndex(x, y);
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
        while (!solution.solved()) {
            let cell = [...solution.cells].filter(cell => !cell.solved).sort((a, b) => a.options.length - b.options.length)[0];
            let index = solution.cells.indexOf(cell);
            let [x, y] = solution.indexToPosition(index);
            this.collapse(solution, x, y);
        }
    }
    #propagate(solution, x, y) {
        // insert first point into open queue
        let open = [[x, y]];
        do {
            // Sort open points per available options in ascending order
            open.sort(([xa, ya], [xb, yb]) => {
                let a = solution.cells[solution.positionToIndex(xa, ya)];
                let b = solution.cells[solution.positionToIndex(xb, yb)];
                return a.options.length - b.options.length;
            });
            // Find the list of points which have the same smallest amount of options left
            let ties = open.filter(([x, y]) => solution.cells[solution.positionToIndex(x, y)].options.length === solution.cells[solution.positionToIndex(...open[0])].options.length);
            // Pick one
            let chosenOne = ties[Math.floor(Math.random() * ties.length)];
            open.splice(open.indexOf(chosenOne), 1);
            // Find cell
            let cell = solution.cells[solution.positionToIndex(...chosenOne)];
            // For each side
            for (let side of [WFC.Side.TOP, WFC.Side.RIGHT, WFC.Side.BOTTOM, WFC.Side.LEFT]) {
                let neighborPosition = solution.neighborOf(...chosenOne, side);
                if (!neighborPosition)
                    continue;
                let [nx, ny] = neighborPosition;
                let index = solution.positionToIndex(nx, ny);
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
        } while (open.length);
    }
}
export var WFC;
(function (WFC) {
    let Side;
    (function (Side) {
        Side[Side["TOP"] = 0] = "TOP";
        Side[Side["RIGHT"] = 1] = "RIGHT";
        Side[Side["BOTTOM"] = 2] = "BOTTOM";
        Side[Side["LEFT"] = 3] = "LEFT";
    })(Side = WFC.Side || (WFC.Side = {}));
    function areConnectionTripleMatching(tripleA, tripleB) {
        for (let indexA = 0; indexA < 3; indexA++)
            if (tripleA[indexA] !== tripleB[2 - indexA])
                return false;
        return true;
    }
    WFC.areConnectionTripleMatching = areConnectionTripleMatching;
    function areConnectionsCompatible(connectionA, connectionB) {
        connectionA.side === (connectionB.side + 2) % 4;
        return areConnectionTripleMatching(connectionA.connection, connectionB.connection);
    }
    WFC.areConnectionsCompatible = areConnectionsCompatible;
    class Solution {
        size = [1, 1];
        cells = [];
        wfc;
        constructor(width, height, wfc) {
            if (width < 1 || height < 1)
                throw 'Solution size cannot be less than 1x1';
            this.size = [width, height];
            this.wfc = wfc;
            let options = wfc.getAvailableOptions();
            for (let index = 0; index < width * height; index++)
                this.cells.push({ options: [...options], solved: false });
        }
        get width() { return this.size[0]; }
        get height() { return this.size[1]; }
        solved() {
            return this.cells.every(cell => cell.solved);
        }
        getIndex(index) { return this.cells[index]; }
        getPosition(x, y) { }
        indexToPosition(index) {
            return [index % this.width, Math.floor(index / this.width)];
        }
        positionToIndex(x, y) {
            return x + y * this.width;
        }
        containsPosition(x, y) {
            return 0 <= x && x < this.width && 0 <= y && y < this.height;
        }
        neighborOf(x, y, side) {
            switch (side) {
                case Side.TOP:
                    y++;
                    break;
                case Side.RIGHT:
                    x++;
                    break;
                case Side.BOTTOM:
                    y--;
                    break;
                case Side.LEFT:
                    x--;
                    break;
                default:
                    y++;
            }
            if (this.containsPosition(x, y))
                return [x, y];
            return null;
        }
    }
    WFC.Solution = Solution;
})(WFC || (WFC = {}));
