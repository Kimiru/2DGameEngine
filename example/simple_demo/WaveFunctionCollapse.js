var Direction;
(function (Direction) {
    Direction[Direction["RIGHT"] = 0] = "RIGHT";
    Direction[Direction["LEFT"] = 1] = "LEFT";
    Direction[Direction["TOP"] = 2] = "TOP";
    Direction[Direction["BOTTOM"] = 3] = "BOTTOM";
    Direction[Direction["HORIZONTAL"] = 4] = "HORIZONTAL";
    Direction[Direction["VERTICAL"] = 5] = "VERTICAL";
    Direction[Direction["ALL"] = 6] = "ALL";
})(Direction || (Direction = {}));
var DirectionOffset = [];
DirectionOffset.push([[1, 0]]);
DirectionOffset.push([[-1, 0]]);
DirectionOffset.push([[0, 1]]);
DirectionOffset.push([[0, -1]]);
DirectionOffset.push([...DirectionOffset[0], ...DirectionOffset[1]]);
DirectionOffset.push([...DirectionOffset[2], ...DirectionOffset[3]]);
DirectionOffset.push([...DirectionOffset[4], ...DirectionOffset[5]]);
class Prototype {
    id;
    sockets;
    antisocket;
    neighbours;
    antineighbours;
    weight = 1;
    /**
     *
     * @param {string} id
     * @param {{ left: string, right: string, top: string, bottom: string }} sockets
     */
    constructor(id, sockets = { left: '-1', right: '-1', top: '-1', bottom: '-1' }, weight = 1, antisocket = { left: '', right: '', top: '', bottom: '' }) {
        this.id = id;
        this.sockets = sockets;
        this.neighbours = { left: new Set(), right: new Set(), top: new Set(), bottom: new Set() };
        this.antineighbours = { left: new Set(), right: new Set(), top: new Set(), bottom: new Set() };
        this.antisocket = antisocket;
    }
    rotateRight() {
        return [this, new Prototype(this.id + '_1', {
            left: this.sockets.bottom,
            top: this.sockets.left,
            right: this.sockets.top,
            bottom: this.sockets.right
        }, this.weight, {
            left: this.antisocket.bottom,
            top: this.antisocket.left,
            right: this.antisocket.top,
            bottom: this.antisocket.right
        })];
    }
    rotateLeft() {
        return [this, new Prototype(this.id + '_3', {
            right: this.sockets.bottom,
            bottom: this.sockets.left,
            left: this.sockets.top,
            top: this.sockets.right
        }, this.weight, {
            right: this.antisocket.bottom,
            bottom: this.antisocket.left,
            left: this.antisocket.top,
            top: this.antisocket.right
        })];
    }
    rotate180() {
        return [this, new Prototype(this.id + '_2', {
            left: this.sockets.right,
            bottom: this.sockets.top,
            right: this.sockets.left,
            top: this.sockets.bottom
        }, this.weight, {
            left: this.antisocket.right,
            bottom: this.antisocket.top,
            right: this.antisocket.left,
            top: this.antisocket.bottom
        })];
    }
    rotate360() {
        return [this, this.rotateRight()[1], this.rotate180()[1], this.rotateLeft()[1]];
    }
}
class CollapseMethods {
    static firstComeFirstServed(wfc, x, y) {
        return wfc.get(x, y)[0];
    }
    static servRandom(wfc, x, y) {
        let cell = wfc.get(x, y);
        return [...cell][Math.floor(Math.random() * cell.size)];
    }
    static servWeightedRandom(wfc, x, y) {
        let cell = wfc.get(x, y);
        let list = [];
        for (let value of cell)
            for (let index = 0; index < wfc.prototypes.get(value).weight; index++)
                list.push(value);
        return list[Math.floor(Math.random() * list.length)];
    }
}
class WaveFunctionCollapse {
    width;
    height;
    cellCount;
    prototypes = new Map();
    prototypesIds = [];
    map;
    collapseMethod = CollapseMethods.servRandom;
    constructor(width, height) {
        this.resize(width, height);
    }
    inside(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.cellCount = this.width * this.height;
        this.reset();
    }
    reset() {
        this.map = [];
        for (let index = 0; index < this.cellCount; index++)
            this.map.push(new Set([...this.prototypesIds]));
    }
    /**
     * get the cell at the given coordinates
     *
     * @param {number} x
     * @param {number} y
     * @return {Set<string}
     */
    get(x, y) { return this.map[x * this.height + y]; }
    /**
     * set the cell at the given position by mutating it
     *
     * @param {number} x
     * @param {number} y
     * @param {string[]} ids
     */
    set(x, y, ids) {
        let cell = this.get(x, y);
        cell.clear();
        ids.forEach(id => cell.add(id));
        this.propagate(x, y);
    }
    /**
     *
     * @param {string[]} ids
     */
    ring(ids) {
        this.map.forEach((cell, index) => {
            let x = Math.floor(index / this.height);
            let y = index % this.height;
            if (x == 0 || x == this.width - 1 ||
                y == 0 || y == this.height - 1)
                if (cell.size > 1) {
                    cell.clear();
                    ids.forEach(id => cell.add(id));
                    this.propagate(x, y);
                }
        });
    }
    addPrototype(...prototypes) {
        let dirs = ['left', 'top', 'right', 'bottom'];
        function dir(n) { return dirs[n % dirs.length]; }
        for (let prototype of prototypes) {
            this.prototypes.set(prototype.id, prototype);
            for (let [_, currentPrototype] of this.prototypes) {
                for (let index = 0; index < dirs.length; index++) {
                    let currentSide = dir(index);
                    let addedSide = dir(index + 2);
                    let currentType = currentPrototype.sockets[currentSide];
                    let addedType = prototype.sockets[addedSide];
                    if (currentType.length !== 0 && currentType.length !== 0)
                        if ((currentType == addedType && currentType[currentType.length - 1] == 's') ||
                            currentType == addedType + 'f' ||
                            addedType == currentType + 'f') {
                            currentPrototype.neighbours[currentSide].add(prototype);
                            prototype.neighbours[addedSide].add(currentPrototype);
                        }
                    let antiCurrentType = currentPrototype.antisocket[currentSide];
                    let antiAddedType = prototype.antisocket[addedSide];
                    if (antiCurrentType.length !== 0 && antiAddedType.length !== 0)
                        if ((antiCurrentType == antiAddedType && antiCurrentType[currentType.length - 1] == 's') ||
                            antiCurrentType == antiAddedType + 'f' ||
                            antiAddedType == antiCurrentType + 'f') {
                            currentPrototype.antineighbours[currentSide].add(prototype);
                            prototype.antineighbours[addedSide].add(currentPrototype);
                        }
                }
            }
        }
        this.prototypesIds = [];
        for (let prototype of this.prototypes)
            this.prototypesIds.push(prototype[0]);
        this.reset();
    }
    collapseCell(x, y) {
        let value = this.collapseMethod(this, x, y);
        let cell = this.get(x, y);
        cell.clear();
        cell.add(value);
    }
    propagate(x, y) {
        let stack = [[x, y]];
        while (stack.length) {
            let currentCoord = stack.pop();
            for (let direction of DirectionOffset[Direction.ALL]) {
                let otherCoord = [currentCoord[0] + direction[0], currentCoord[1] + direction[1]];
                let otherPossiblePrototypes = this.getPrototypeForCell(otherCoord[0], otherCoord[1]);
                // console.log(direction)
                // console.log(otherPossiblePrototypes)
                let possibleNeighbours = this.getPossibleNeighbourPrototypeForCell(currentCoord[0], currentCoord[1], direction[0], direction[1]);
                let antiNeighbours = this.getAntiNeighbourPrototypeForCell(currentCoord[0], currentCoord[1], direction[0], direction[1]);
                // console.log('possible', possibleNeighbours)
                if (otherPossiblePrototypes.length == 0)
                    continue;
                // console.log(antiNeighbours)
                for (let otherPrototype of otherPossiblePrototypes)
                    if (!possibleNeighbours.includes(otherPrototype) || antiNeighbours.includes(otherPrototype)) {
                        this.get(otherCoord[0], otherCoord[1]).delete(otherPrototype.id);
                        if (stack.every(coord => coord[0] != otherCoord[0] || coord[1] != otherCoord[1]))
                            stack.push(otherCoord);
                    }
            }
        }
    }
    getPrototypeForCell(x, y) {
        let prototypes = [];
        if (!this.inside(x, y))
            return prototypes;
        let cell = this.get(x, y);
        for (let entry of this.prototypes)
            if (cell.has(entry[0]))
                prototypes.push(entry[1]);
        return prototypes;
    }
    getPossibleNeighbourPrototypeForCell(x, y, dx, dy) {
        let prototypes = new Set();
        let cell = this.get(x, y);
        let side = 'top';
        if (dx == 1 && dy == 0)
            side = 'right';
        if (dx == -1 && dy == 0)
            side = 'left';
        if (dx == 0 && dy == 1)
            side = 'top';
        if (dx == 0 && dy == -1)
            side = 'bottom';
        for (let possibility of cell)
            for (let prototype of this.prototypes.get(possibility).neighbours[side])
                prototypes.add(prototype);
        return [...prototypes];
    }
    getAntiNeighbourPrototypeForCell(x, y, dx, dy) {
        let prototypes = new Set();
        let cell = this.get(x, y);
        let side = 'top';
        if (dx == 1 && dy == 0)
            side = 'right';
        if (dx == -1 && dy == 0)
            side = 'left';
        if (dx == 0 && dy == 1)
            side = 'top';
        if (dx == 0 && dy == -1)
            side = 'bottom';
        for (let possibility of cell)
            for (let prototype of this.prototypes.get(possibility).antineighbours[side])
                prototypes.add(prototype);
        return [...prototypes];
    }
    runTocompletion() {
        while (!this.complete()) {
            let cell = this.getMinEntropyCell();
            this.collapseCell(cell[0], cell[1]);
            this.propagate(cell[0], cell[1]);
        }
        return !this.failed();
    }
    getMinEntropyCell() {
        let min = Infinity;
        let cellindex = -1;
        for (let [index, cell] of this.map.entries())
            if (cell.size != 1 && cell.size < min) {
                min = cell.size;
                cellindex = index;
            }
        return [Math.floor(cellindex / this.height), cellindex % this.height];
    }
    complete() {
        return this.map.every(cell => cell.size <= 1);
    }
    failed() {
        return this.map.some(entry => entry.size == 0);
    }
    results() {
        return this.map.map(set => set.values().next().value);
    }
}
export { Direction, CollapseMethods, DirectionOffset, Prototype, WaveFunctionCollapse };
