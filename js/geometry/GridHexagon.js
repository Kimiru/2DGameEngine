import { HexVector } from "../math/HexVector.js";
import { Hexagon } from "./Hexagon.js";
export class GridHexagon extends Hexagon {
    hexVector;
    constructor(hexVector = new HexVector()) {
        super(undefined, hexVector.orientation, hexVector.unit);
        this.hexVector = hexVector.clone();
        this.hexVector.vector = this.transform.translation;
        this.hexVector.updateVector();
    }
    getLinear() {
        this.orientation = this.hexVector.orientation;
        this.unit = this.hexVector.unit;
        return super.getLinear();
    }
}
