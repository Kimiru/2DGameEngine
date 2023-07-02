
export type blockposition = [number, number, number]

export class Block<T> {

    width: number = 1
    height: number = 1
    depth: number = 1

    cells: T[]

    constructor(width: number, height: number, depth: number, cellBuilder: (x: number, y: number, z: number, index: number) => T) {

        if (width < 1 || height < 1 || depth < 1) throw 'Block dimension cannot be less than 1x1x1'

        this.width = width
        this.height = height
        this.depth = depth

        this.cells = []

        for (let index = 0; index < width * height * depth; index++) {

            let [x, y, z] = this.indexToPosition(index)

            this.cells.push(cellBuilder(x, y, z, index))

        }

    }

    getCellAtIndex(index: number): T { return this.cells[index] }

    getCellAtPosition(x: number, y: number, z: number): T | null {
        if (!this.containsPosition(x, y, z)) return null
        return this.cells[this.positionToIndex(x, y, z)] ?? null
    }

    indexToPosition(index: number): blockposition {

        let x = index % this.width
        let y = Math.floor(index / this.width) % this.height
        let z = Math.floor(index / (this.width * this.height))

        return [x, y, z]

    }

    positionToIndex(x: number, y: number, z: number): number {

        return x + y * this.width + z * (this.width * this.height)

    }

    containsPosition(x: number, y: number, z: number): boolean {

        return 0 <= x && x < this.width && 0 <= y && y < this.height && 0 <= z && z < this.depth

    }

    neighborOf(x: number, y: number, z: number, side: Block.Side): blockposition | null {

        let [sx, sy, sz] = Block.sideToDir(side)

        x += sx
        y += sy
        z += sz

        if (this.containsPosition(x, y, z))
            return [x, y, z]

        return null

    }

    static blockPositionToId(position: blockposition): string {

        return position.join('|')

    }

    static idToBlockPosition(id: string): blockposition {
        return id.split('|').map(Number) as blockposition
    }

}

export namespace Block {
    export enum Side {
        LEFT = 0,
        RIGHT = 1,
        DOWN = 2,
        UP = 3,
        BACK = 4,
        FRONT = 5
    }

    export function sideToDir(side: Block.Side): blockposition {

        let x = 0, y = 0, z = 0

        switch (side) {
            case Block.Side.LEFT:
                x--
                break
            case Block.Side.RIGHT:
                x++
                break
            case Block.Side.DOWN:
                y--
                break
            case Block.Side.UP:
                y++
                break
            case Block.Side.BACK:
                z--
                break
            case Block.Side.FRONT:
                z++
                break

            default:
                y++
        }

        return [x, y, z]

    }

    export function dirToSide(x: number, y: number, z: number): Side {

        if (x < 0) return Side.LEFT
        if (x > 0) return Side.RIGHT
        if (y < 0) return Side.DOWN
        if (y > 0) return Side.UP
        if (z < 0) return Side.BACK
        if (z > 0) return Side.FRONT

        return Side.UP

    }
}
