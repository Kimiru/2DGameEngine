import { GameComponent, Polygon, Vector } from "../2DGameEngine.js";
export class RigitBodyComponent extends GameComponent {
    unique = true;
    velocity = new Vector();
    acceleration = new Vector();
    momentsOfInertia = [];
    momentOfInertia = 1;
    angularVelocity = 0;
    angularAcceleration = 0;
    polygon;
    mass;
    constructor(polygon, weight) {
        super('RigitBody');
        this.updatePolygon(polygon, weight);
    }
    updatePolygon(polygon, weight) {
        this.mass = weight;
        let centerOfMass = new Vector();
        for (let point of polygon.outer) {
            centerOfMass.add(point);
        }
        centerOfMass.divS(polygon.outer.length);
        this.polygon = new Polygon(polygon.outer.map(point => point.clone().sub(centerOfMass)));
        this.momentsOfInertia = this.polygon.outer.map(({ x, y }) => this.mass / this.polygon.outer.length * (x * x + y * y));
        this.momentOfInertia = this.momentsOfInertia.reduce((a, b) => a + b);
    }
    physics(dt) {
        let dt2 = dt * dt;
        let delta = this.velocity.clone().multS(dt)
            .add(this.acceleration.clone().multS(dt2 * .5));
        this.velocity.add(this.acceleration.clone().multS(dt));
        this.acceleration.set(0, 0);
        this.parent.position.copy(delta);
        let deltaAngle = this.angularVelocity * dt + this.angularAcceleration * dt2 * .5;
        this.angularVelocity += this.angularAcceleration * dt;
        this.angularAcceleration = 0;
        this.parent.rotation += deltaAngle;
    }
    applyForce(position, force) {
        this.acceleration.add(force.clone().divS(this.mass));
        this.angularAcceleration += (position.x * force.y - position.y * force.x) / this.momentOfInertia;
    }
}
