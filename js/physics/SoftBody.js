import { GameObject, Vector } from "../2DGameEngine.js";
export var SoftBody;
(function (SoftBody) {
    class Solver extends GameObject {
        integrableBodies = [];
        constraints = [];
        addIntegrableBody(...integrableBodies) {
            for (let integrableBody of integrableBodies) {
                if (this.integrableBodies.indexOf(integrableBody) !== -1)
                    continue;
                this.integrableBodies.push(integrableBody);
            }
        }
        removeIntegrableBody(...integrableBodies) {
            for (let IntegrableBody of integrableBodies) {
                if (this.integrableBodies.indexOf(IntegrableBody) === -1)
                    continue;
                this.integrableBodies.splice(this.integrableBodies.indexOf(IntegrableBody), 1);
            }
        }
        addConstraint(...constraints) {
            for (let constraint of constraints) {
                if (this.constraints.indexOf(constraint) !== -1)
                    continue;
                this.constraints.push(constraint);
            }
        }
        removeConstraint(...constraints) {
            for (let constraint of constraints) {
                if (this.constraints.indexOf(constraint) === -1)
                    continue;
                this.constraints.splice(this.constraints.indexOf(constraint), 1);
            }
        }
        physics(dt) {
            for (let constraint of this.constraints)
                constraint.applyConstraint();
            for (let integrableBody of this.integrableBodies)
                integrableBody.integrate(dt);
        }
    }
    SoftBody.Solver = Solver;
    class Point {
        position = new Vector();
        velocity = new Vector();
        acceleration = new Vector();
        freeze = false;
        constructor(position = new Vector, velocity = new Vector, acceleration = new Vector, freeze = false) {
            this.position = position;
            this.velocity = velocity;
            this.acceleration = acceleration;
            this.freeze = freeze;
        }
        integrate(dt) {
            this.position
                .add(this.velocity.clone().multS(dt))
                .add(this.acceleration.clone().multS(dt * dt * .5));
            this.velocity.add(this.acceleration.clone().multS(dt));
        }
    }
    SoftBody.Point = Point;
    class Shape extends GameObject {
        points;
        constructor(points) {
            super();
            if (points.length < 3)
                throw 'Shape cannot have less than 3 points';
            this.addTag('SB.Shape');
            this.points = points;
        }
        integrate(dt) {
            for (let point of this.points)
                point.integrate(dt);
        }
    }
    SoftBody.Shape = Shape;
    class Spring {
        point_0;
        point_1;
        stiffness;
        damping;
        restLength;
        constructor(point_0, point_1, stiffness = 1, damping = 1, restLength) {
            if (point_0 === point_1)
                throw ('Springs cannot have both end attached to the same point');
            this.point_0 = point_0;
            this.point_1 = point_1;
            this.stiffness = stiffness;
            this.damping = damping;
            if (restLength === undefined)
                this.relaxSpring();
            else
                this.restLength = restLength;
        }
        relaxSpring() {
            this.restLength = this.point_0.position.distanceTo(this.point_1.position);
        }
        applyConstraint() {
            if (this.point_0.freeze && this.point_1.freeze)
                return;
            let dir = this.point_1.position.clone().sub(this.point_0.position).normalize();
            let currentLength = this.point_0.position.distanceTo(this.point_1.position);
            let deltaLength = currentLength - this.restLength;
            let force = this.stiffness * deltaLength;
            let damping = this.point_1.velocity.clone().projectOn(dir).sub(this.point_0.velocity.clone().projectOn(dir)).multS(this.damping);
            let forceVector = dir.clone().multS(force).add(damping);
            if (!this.point_0.freeze && !this.point_1.freeze) {
                forceVector.divS(2);
                this.point_0.acceleration.add(forceVector);
                forceVector.multS(-1);
                this.point_1.acceleration.add(forceVector);
            }
            else if (!this.point_1.freeze) {
                forceVector.multS(-1);
                this.point_1.acceleration.add(forceVector);
            }
            else {
                this.point_0.acceleration.add(forceVector);
            }
        }
    }
    SoftBody.Spring = Spring;
})(SoftBody = SoftBody || (SoftBody = {}));
