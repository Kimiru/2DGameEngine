import { HexagonGraphInterface } from "../math/Graph.js";
import { HexVector } from "../math/HexVector.js";
import { Vector } from "../math/Vector.js";
import { Hexagon } from "./Hexagon.js";
export declare class GridHexagon extends Hexagon implements HexagonGraphInterface {
    hexVector: HexVector;
    constructor(hexVector?: HexVector);
    getLinear(): Vector[];
}
