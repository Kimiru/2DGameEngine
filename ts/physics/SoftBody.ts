import { GameObject, Vector } from "../2DGameEngine.js";

export namespace SoftBody {

    export class Solver extends GameObject {

        springs: Spring[] = []
        shapes: Shape[] = []

        addSpring(...springs: Spring[]) {

            for (let spring of springs) {

                if (this.springs.indexOf(spring) !== -1) continue

                this.springs.push(spring)

            }

        }

        removeSpring(...springs: Spring[]) {

            for (let spring of springs) {

                if (this.springs.indexOf(spring) === -1) continue

                this.springs.splice(this.springs.indexOf(spring), 1)

            }

        }

        addShape(...shapes: Shape[]) {

            for (let shape of shapes) {

                if (this.shapes.indexOf(shape) !== -1) continue

                this.shapes.push(shape)

            }

        }

        removeShape(...shapes: Shape[]) {

            for (let shape of shapes) {

                if (this.shapes.indexOf(shape) === -1) continue

                this.shapes.splice(this.shapes.indexOf(shape), 1)

            }

        }

        physics(dt: number): void {

            for (let spring of this.springs)
                spring.applyConstraint()

            for (let shape of this.shapes)
                shape.integratePoints(dt)

        }

    }

    export class Point {

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

    export class Shape extends GameObject {

        points: Point[]

        constructor(points: Point[]) {

            super()

            if (points.length < 3) throw 'Shape cannot have less than 3 points'


            this.addTag('SB.Shape')

            this.points = points

        }

        integratePoints(dt) {

            for (let point of this.points)
                point.integrate(dt)

        }

    }

    export class Spring {

        point_0: Point
        point_1: Point

        strength: number
        restLength: number

        constructor(point_0: Point, point_1: Point, strength: number, restLength?: number) {

            if (point_0 === point_1) throw ('Springs cannot have both end attached to the same point')

            this.point_0 = point_0
            this.point_1 = point_1

            this.strength = strength

            if (restLength === undefined)
                this.relaxSpring()
            else
                this.restLength = restLength

        }

        relaxSpring() {

            this.restLength = length ?? this.point_0.position.distanceTo(this.point_1.position)

        }

        applyConstraint() {

            if (this.point_0.freeze && this.point_1.freeze) return

            let currentLength = this.point_0.position.distanceTo(this.point_1.position)

            let deltaLength = currentLength - this.restLength

            let force = -this.strength * deltaLength

            let forceVector = this.point_1.position.clone().sub(this.point_0.position).normalize().multS(force)


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