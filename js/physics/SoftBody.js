import { GameObject, Polygon, Ray, Segment, Vector, quadBezier } from "../2DGameEngine.js";
export var SoftBody;
(function (SoftBody) {
    /**
     * Create a soft body physics solver
     */
    class Solver extends GameObject {
        constructor() {
            super();
        }
        constraints = [];
        /**
         * Add a constraint to the system.
         * Contraints are used to alter the force arround the system
         *
         * @param constraints
         */
        addConstraint(...constraints) {
            for (let constraint of constraints) {
                if (this.constraints.indexOf(constraint) !== -1)
                    continue;
                this.constraints.push(constraint);
            }
        }
        /**
         * Remove a constraint from the system
         *
         * @param constraints
         */
        removeConstraint(...constraints) {
            for (let constraint of constraints) {
                if (this.constraints.indexOf(constraint) === -1)
                    continue;
                this.constraints.splice(this.constraints.indexOf(constraint), 1);
            }
        }
        integrableBodies = [];
        /**
         * Add an integrable body to the system.
         * Integrable body are points or groups of points that can move in the system
         *
         * @param integrableBodies
         */
        addIntegrableBody(...integrableBodies) {
            for (let integrableBody of integrableBodies) {
                if (this.integrableBodies.indexOf(integrableBody) !== -1)
                    continue;
                this.integrableBodies.push(integrableBody);
            }
        }
        /**
         * Remove an integrable body from the system.
         *
         * @param integrableBodies
         */
        removeIntegrableBody(...integrableBodies) {
            for (let IntegrableBody of integrableBodies) {
                if (this.integrableBodies.indexOf(IntegrableBody) === -1)
                    continue;
                this.integrableBodies.splice(this.integrableBodies.indexOf(IntegrableBody), 1);
            }
        }
        collidableBodies = [];
        /**
         * Add a collidable body to the system.
         * Integrable body will not penetrate through collidable body unless predicate says otherwise
         *
         * @param collidableBodies
         */
        addCollidableBody(...collidableBodies) {
            for (let collidableBody of collidableBodies) {
                if (this.collidableBodies.indexOf(collidableBody) !== -1)
                    continue;
                this.collidableBodies.push(collidableBody);
            }
        }
        /**
         * Remove a collidable body to the system.
         *
         * @param collidableBodies
         */
        removeCollidableBody(...collidableBodies) {
            for (let collidableBody of collidableBodies) {
                if (this.collidableBodies.indexOf(collidableBody) === -1)
                    continue;
                this.collidableBodies.splice(this.collidableBodies.indexOf(collidableBody), 1);
            }
        }
        /**
         * Apply the physics of the system in order:
         * - contraints
         * - integrations
         * - collisions
         *
         * @param dt
         */
        physics(dt) {
            for (let constraint of this.constraints)
                constraint.applyConstraint();
            for (let integrableBody of this.integrableBodies)
                integrableBody.integrate(dt);
            for (let collidableBody of this.collidableBodies)
                for (let integrableBody of this.integrableBodies)
                    if (collidableBody !== integrableBody && collidableBody.predicateCollision(integrableBody)) {
                        let frixion;
                        let absorption;
                        if ('frixion' in integrableBody && 'absorption' in integrableBody) {
                            frixion = Math.min(integrableBody.frixion, collidableBody.frixion);
                            absorption = Math.max(integrableBody.absorption, collidableBody.absorption);
                        }
                        else {
                            frixion = collidableBody.frixion;
                            absorption = collidableBody.absorption;
                        }
                        for (let point of integrableBody.getPoints())
                            this.resolveCollision(point, collidableBody, frixion, absorption);
                    }
        }
        resolveCollision(point, collidableBody, frixion = collidableBody.frixion, absorption = collidableBody.absorption) {
            if (collidableBody.containsPoint(point)) {
                let AB = collidableBody.closestEdgeOfPoint(point);
                this.resolveEdgeCollision(point, AB);
                this.resolveEdgeCollisionVelocity(point, AB, frixion, absorption);
            }
        }
        resolveEdgeCollision(P, [A, B]) {
            this.resolveEdgeCollisionPosition(P, [A, B]);
        }
        resolveEdgeCollisionPosition({ position: P }, [{ position: A }, { position: B }]) {
            let AB = A.to(B);
            let AP = A.to(P);
            let normal = AB.normal();
            let dir = AP.projectOn(normal);
            let percent = AP.dot(AB) / AB.normSquared();
            let pA = quadBezier([.5], [.4], [0], percent)[0];
            let pB = quadBezier([0], [.4], [.5], percent)[0];
            A.add(dir.clone().multS(pA));
            B.add(dir.clone().multS(pB));
            P.copy(new Ray(P, dir.multS(-1)).intersect(new Segment(A, B)) ?? P);
        }
        resolveEdgeCollisionVelocity(P, [A, B], frixion, absorption) {
            let tangent = A.position.to(B.position);
            let normal = tangent.normal();
            let edgeVelocity = A.velocity.clone().add(B.velocity).divS(2);
            let edgeTangentVelocity = edgeVelocity.projectOn(tangent);
            let edgeNormalVelocity = edgeVelocity.projectOn(normal);
            let pointTangentVelocity = P.velocity.projectOn(tangent);
            let pointNormalVelocity = P.velocity.projectOn(normal);
            let relativeNormalVelocity = edgeNormalVelocity.clone().sub(pointNormalVelocity).multS(absorption * .5);
            let relativeTangentVelocity = edgeTangentVelocity.clone().sub(pointTangentVelocity).multS(frixion * .5);
            P.velocity.copy(edgeNormalVelocity.sub(relativeNormalVelocity))
                .add(pointTangentVelocity.add(relativeTangentVelocity));
            A.velocity.copy(pointNormalVelocity.add(relativeNormalVelocity))
                .add(edgeTangentVelocity.sub(relativeTangentVelocity));
            B.velocity.copy(A.velocity);
        }
    }
    SoftBody.Solver = Solver;
    class Point {
        position = new Vector();
        velocity = new Vector();
        acceleration = new Vector();
        frixion = 1;
        absorption = 0;
        freeze = false;
        constructor(position = new Vector, velocity = new Vector, acceleration = new Vector, frixion = 1, absorption = 0, freeze = false) {
            this.position = position;
            this.velocity = velocity;
            this.acceleration = acceleration;
            this.frixion = frixion;
            this.absorption = absorption;
            this.freeze = freeze;
        }
        getPoints() {
            return [this];
        }
        integrate(dt) {
            this.position
                .add(this.velocity.clone().multS(dt))
                .add(this.acceleration.clone().multS(dt * dt * .5));
            this.velocity.add(this.acceleration.clone().multS(dt));
            this.acceleration.set(0, 0);
        }
    }
    SoftBody.Point = Point;
    class Shape extends GameObject {
        points;
        frixion = 1;
        absorption = 0;
        constructor(points, frixion = 1, absorption = 0) {
            super();
            if (points.length < 3)
                throw 'Shape cannot have less than 3 points';
            this.addTag('SB.Shape');
            this.points = points;
            this.frixion = frixion;
            this.absorption = absorption;
        }
        predicateCollision(integrableBody) {
            return true;
        }
        getPoints() {
            return this.points;
        }
        getPointsCenter() {
            return computeCenter(this.points);
        }
        integrate(dt) {
            for (let point of this.points)
                point.integrate(dt);
        }
        containsPoint(point) {
            return new Polygon(this.points.map(point => point.position)).containsVector(point.position);
        }
        distancePointToEdge(point, [A, B]) {
            let vec = A.to(point);
            let seg = A.to(B);
            let seglen = seg.length();
            let projection = vec.dot(seg) / seglen;
            if (projection < 0)
                return point.distanceTo(A);
            else if (projection > seglen)
                return point.distanceTo(B);
            else
                return vec.projectOn(seg.normal()).length();
        }
        closestEdgeOfPoint(point) {
            let closestSegment_0 = -1;
            let closestSegment_1 = -1;
            let minLength = -1;
            for (let index = 0; index < this.points.length; index++) {
                let index_0 = index;
                let index_1 = (index + 1) % this.points.length;
                let p0 = this.points[index_0];
                let p1 = this.points[index_1];
                let dist = this.distancePointToEdge(point.position, [p0.position, p1.position]);
                if (closestSegment_0 === -1 || dist < minLength) {
                    closestSegment_0 = index_0;
                    closestSegment_1 = index_1;
                    minLength = dist;
                }
            }
            return [this.points[closestSegment_0], this.points[closestSegment_1]];
        }
        addForce(force) {
            for (let point of this.points)
                point.acceleration.add(force);
        }
    }
    SoftBody.Shape = Shape;
    class Spring {
        static stiffness = 100;
        static damping = 1;
        static angularDamping = 0;
        point_0;
        point_1;
        stiffness;
        damping;
        angularDamping;
        restLength;
        constructor(point_0, point_1, stiffness = Spring.stiffness, damping = Spring.damping, restLength, angularDamping = Spring.angularDamping) {
            if (point_0 === point_1)
                throw ('Springs cannot have both end attached to the same point');
            this.point_0 = point_0;
            this.point_1 = point_1;
            this.stiffness = stiffness;
            this.damping = damping;
            this.angularDamping = angularDamping;
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
            if (this.point_0.position.distanceTo(this.point_1.position) === 0)
                return;
            let dir = this.point_0.position.to(this.point_1.position).normalize();
            let currentLength = this.point_0.position.distanceTo(this.point_1.position);
            let deltaLength = currentLength - this.restLength;
            let force = this.stiffness * deltaLength;
            let p01 = this.point_0.velocity.to(this.point_1.velocity);
            let damping = p01.projectOn(dir).multS(this.damping);
            let angularDamping = p01.projectOn(dir.normal()).multS(this.angularDamping);
            let forceVector = dir.clone().multS(force).add(damping).add(angularDamping);
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
    class Frame extends Shape {
        freeze = false;
        falseStructure = [];
        structure = [];
        springs = [];
        constructor(points, freeze = false, springStiffness, springDamping, frixion = 1, absorption = 0) {
            super(points);
            this.freeze = freeze;
            this.frixion = frixion;
            this.absorption = absorption;
            for (let point of this.points) {
                let framePoint = new Point(point.position.clone());
                framePoint.freeze = freeze;
                this.structure.push(framePoint);
                this.falseStructure.push(new Point(point.position.clone()));
                let spring = new Spring(point, framePoint, springStiffness, springDamping, 0, (springDamping ?? Spring.damping) / 2);
                this.springs.push(spring);
            }
        }
        applyConstraint() {
            if (!this.freeze) {
                let pointsCenter = this.getPointsCenter();
                let frameCenter = this.getFrameCenter();
                let delta = frameCenter.to(pointsCenter);
                for (let point of this.structure)
                    point.position.add(delta);
                let angle = 0;
                for (let [index, point] of this.points.entries()) {
                    let structPoint = this.structure[index];
                    let pointAngle = pointsCenter.to(point.position).rotate(-pointsCenter.to(structPoint.position).angle()).angle();
                    angle += pointAngle;
                }
                angle /= this.points.length;
                for (let point of this.structure)
                    point.position.rotateAround(pointsCenter, angle);
            }
            for (let spring of this.springs) {
                if (!this.freeze)
                    spring.point_1.velocity.copy(spring.point_0.velocity).divS(2);
                spring.applyConstraint();
            }
        }
        getFrameCenter() {
            return computeCenter(this.structure);
        }
        integrate(dt) {
            if (this.freeze)
                for (let [index, falsePoint] of this.falseStructure.entries()) {
                    let truePoint = this.structure[index];
                    truePoint.position.copy(this.position.clone().add(falsePoint.position.clone().rotate(this.rotation)));
                }
            super.integrate(dt);
        }
    }
    SoftBody.Frame = Frame;
    function computeCenter(points) {
        let center = new Vector();
        if (points.length === 0)
            return center;
        for (let point of points)
            center.add(point.position);
        center.divS(points.length);
        return center;
    }
})(SoftBody = SoftBody || (SoftBody = {}));
