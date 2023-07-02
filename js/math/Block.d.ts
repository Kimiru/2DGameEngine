export type blockposition = [number, number, number];
export declare class Block<T> {
    width: number;
    height: number;
    depth: number;
    cells: T[];
    constructor(width: number, height: number, depth: number, cellBuilder: (x: number, y: number, z: number, index: number) => T);
    getCellAtIndex(index: number): T;
    getCellAtPosition(x: number, y: number, z: number): T | null;
    indexToPosition(index: number): blockposition;
    positionToIndex(x: number, y: number, z: number): number;
    containsPosition(x: number, y: number, z: number): boolean;
    neighborOf(x: number, y: number, z: number, side: Block.Side): blockposition | null;
    static blockPositionToId(position: blockposition): string;
    static idToBlockPosition(id: string): blockposition;
}
export declare namespace Block {
    enum Side {
        LEFT = 0,
        RIGHT = 1,
        DOWN = 2,
        UP = 3,
        BACK = 4,
        FRONT = 5
    }
    function sideToDir(side: Block.Side): blockposition;
    function dirToSide(x: number, y: number, z: number): Side;
}
