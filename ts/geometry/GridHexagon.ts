import { HexagonGraphInterface } from "../math/Graph.js"
import { HexVector } from "../math/HexVector.js"
import { Vector } from "../math/Vector.js"
import { Hexagon } from "./Hexagon.js"

export class GridHexagon extends Hexagon implements HexagonGraphInterface {

    hexVector: HexVector

    constructor(hexVector: HexVector = new HexVector()) {

        super(undefined, hexVector.orientation, hexVector.unit)

        this.hexVector = hexVector.clone()
        this.hexVector.vector = this.transform.translation
        this.hexVector.updateVector()

    }

    getLinear(): Vector[] {

        this.orientation = this.hexVector.orientation
        this.unit = this.hexVector.unit

        return super.getLinear()

    }

}