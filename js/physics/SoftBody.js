import { GameObject, Vector } from "../2DGameEngine.js";
export var SoftBody;
(function (SoftBody) {
    class Solver extends GameObject {
        physics(dt) {
        }
    }
    class Point {
        position = new Vector();
        velocity = new Vector();
        acceleration = new Vector();
        integrate(dt) {
            this.position
                .add(this.velocity.clone().multS(dt))
                .add(this.acceleration.clone().multS(dt * dt * .5));
            this.velocity.add(this.acceleration.clone().multS(dt));
        }
    }
})(SoftBody || (SoftBody = {}));
