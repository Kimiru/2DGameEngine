import { GameObject, Vector } from "../2DGameEngine.js";

export namespace SoftBody {

    export class Solver extends GameObject {

        integrableBodies: IntegrableBody[] = []
        constraints: Constraint[] = []

        addIntegrableBody(...integrableBodies: IntegrableBody[]) {

            for (let integrableBody of integrableBodies) {

                if (this.integrableBodies.indexOf(integrableBody) !== -1) continue

                this.integrableBodies.push(integrableBody)

            }

        }

        removeIntegrableBody(...integrableBodies: IntegrableBody[]) {

            for (let IntegrableBody of integrableBodies) {

                if (this.integrableBodies.indexOf(IntegrableBody) === -1) continue

                this.integrableBodies.splice(this.integrableBodies.indexOf(IntegrableBody), 1)

            }

        }

        addConstraint(...constraints: Constraint[]) {

            for (let constraint of constraints) {

                if (this.constraints.indexOf(constraint) !== -1) continue

                this.constraints.push(constraint)

            }

        }

        removeConstraint(...constraints: Constraint[]) {

            for (let constraint of constraints) {

                if (this.constraints.indexOf(constraint) === -1) continue

                this.constraints.splice(this.constraints.indexOf(constraint), 1)

            }

        }

        physics(dt: number): void {

            for (let constraint of this.constraints)
                constraint.applyConstraint()

            for (let integrableBody of this.integrableBodies)
                integrableBody.integrate(dt)

        }

    }

    export interface IntegrableBody {

        integrate: (dt: number) => void

    }

    export class Point implements IntegrableBody {

        position: Vector = new Vector()
        velocity: Vector = new Vector()
        acceleration: Vector = new Vector()

        freeze: boolean = false

        constructor(position: Vector = new Vector, velocity: Vector = new Vector, acceleration: Vector = new Vector, freeze: boolean = false) {

            this.position = position
            this.velocity = velocity
            this.acceleration = acceleration

            this.freeze = freeze

        }

        integrate(dt: number) {

            this.position
                .add(this.velocity.clone().multS(dt))
                .add(this.acceleration.clone().multS(dt * dt * .5))

            this.velocity.add(this.acceleration.clone().multS(dt))

        }

    }

    export class Shape extends GameObject implements IntegrableBody {

        points: Point[]

        constructor(points: Point[]) {

            super()

            if (points.length < 3) throw 'Shape cannot have less than 3 points'


            this.addTag('SB.Shape')

            this.points = points

        }

        integrate(dt) {

            for (let point of this.points)
                point.integrate(dt)

        }

    }

    export interface Constraint {

        applyConstraint: () => void

    }

    export class Spring {

        point_0: Point
        point_1: Point

        stiffness: number
        damping: number
        restLength: number

        constructor(point_0: Point, point_1: Point, stiffness: number = 1, damping: number = 1, restLength?: number) {

            if (point_0 === point_1) throw ('Springs cannot have both end attached to the same point')

            this.point_0 = point_0
            this.point_1 = point_1

            this.stiffness = stiffness
            this.damping = damping

            if (restLength === undefined)
                this.relaxSpring()
            else
                this.restLength = restLength

        }

        relaxSpring() {

            this.restLength = this.point_0.position.distanceTo(this.point_1.position)

        }

        applyConstraint() {

            if (this.point_0.freeze && this.point_1.freeze) return
            let dir = this.point_1.position.clone().sub(this.point_0.position).normalize()

            let currentLength = this.point_0.position.distanceTo(this.point_1.position)
            let deltaLength = currentLength - this.restLength

            let force = this.stiffness * deltaLength

            let damping = this.point_1.velocity.clone().projectOn(dir).sub(this.point_0.velocity.clone().projectOn(dir)).multS(this.damping)


            let forceVector = dir.clone().multS(force).add(damping)

            if (!this.point_0.freeze && !this.point_1.freeze) {

                forceVector.divS(2)

                this.point_0.acceleration.add(forceVector)
                forceVector.multS(-1)
                this.point_1.acceleration.add(forceVector)

            }

            else if (!this.point_1.freeze) {

                forceVector.multS(-1)
                this.point_1.acceleration.add(forceVector)

            } else {

                this.point_0.acceleration.add(forceVector)

            }

        }

    }

}