import { GameObject, Vector } from "../2DGameEngine.js";

export namespace SoftBody {

    class Solver extends GameObject {

        physics(dt: number): void {



        }

    }

    class Point {

        position: Vector = new Vector()
        velocity: Vector = new Vector()
        acceleration: Vector = new Vector()

        integrate(dt: number) {

            this.position
                .add(this.velocity.clone().multS(dt))
                .add(this.acceleration.clone().multS(dt * dt * .5))

            this.velocity.add(this.acceleration.clone().multS(dt))

        }

    }



}