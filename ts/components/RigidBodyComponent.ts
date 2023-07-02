import { GameComponent, Polygon, Vector } from "../2DGameEngine.js";

export class RigitBodyComponent extends GameComponent {

    unique: boolean = true

    velocity: Vector = new Vector()
    acceleration: Vector = new Vector()

    momentsOfInertia: number[] = []
    momentOfInertia: number = 1

    angularVelocity: number = 0
    angularAcceleration: number = 0

    polygon: Polygon
    mass: number

    constructor(polygon: Polygon, weight: number) {

        super('RigitBody')

        this.updatePolygon(polygon, weight)

    }

    updatePolygon(polygon: Polygon, weight: number) {

        this.mass = weight

        let centerOfMass: Vector = new Vector()

        for (let point of polygon.outer) {

            centerOfMass.add(point)

        }

        centerOfMass.divS(polygon.outer.length)

        this.polygon = new Polygon(polygon.outer.map(point => point.clone().sub(centerOfMass)))

        this.momentsOfInertia = this.polygon.outer.map(({ x, y }) => this.mass / this.polygon.outer.length * (x * x + y * y))
        this.momentOfInertia = this.momentsOfInertia.reduce((a, b) => a + b)

    }

    physics(dt: number): void {

        let dt2 = dt * dt

        let delta = this.velocity.clone().multS(dt)
            .add(this.acceleration.clone().multS(dt2 * .5))
        this.velocity.add(this.acceleration.clone().multS(dt))

        this.acceleration.set(0, 0)

        this.parent!.position.copy(delta)

        let deltaAngle = this.angularVelocity * dt + this.angularAcceleration * dt2 * .5
        this.angularVelocity += this.angularAcceleration * dt

        this.angularAcceleration = 0

        this.parent!.rotation += deltaAngle

    }

    applyForce(position: Vector, force: Vector) {

        this.acceleration.add(force.clone().divS(this.mass))

        this.angularAcceleration += (position.x * force.y - position.y * force.x) / this.momentOfInertia

    }

}