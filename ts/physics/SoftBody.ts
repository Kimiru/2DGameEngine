import { GameObject, Polygon, Ray, Segment, Vector, quadBezier } from "../2DGameEngine.js";

export namespace SoftBody {

    export class Solver extends GameObject {

        constraints: Constraint[] = []

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

        integrableBodies: IntegrableBody[] = []

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

        collidableBodies: CollidableBody[] = []

        addCollidableBody(...collidableBodies: CollidableBody[]) {

            for (let collidableBody of collidableBodies) {

                if (this.collidableBodies.indexOf(collidableBody) !== -1) continue

                this.collidableBodies.push(collidableBody)

            }

        }

        removeCollidableBody(...collidableBodies: CollidableBody[]) {

            for (let collidableBody of collidableBodies) {

                if (this.collidableBodies.indexOf(collidableBody) === -1) continue

                this.collidableBodies.splice(this.collidableBodies.indexOf(collidableBody), 1)

            }

        }

        physics(dt: number): void {

            for (let constraint of this.constraints)
                constraint.applyConstraint()

            for (let integrableBody of this.integrableBodies)
                integrableBody.integrate(dt)

            for (let collidableBody of this.collidableBodies)
                for (let integrableBody of this.integrableBodies)
                    if (collidableBody as any !== integrableBody)
                        for (let point of integrableBody.getPoints())
                            this.resolveCollision(point, collidableBody)

        }

        resolveCollision(point: Point, collidableBody: CollidableBody) {
            if (collidableBody.containsPoint(point)) {

                let [point_0, point_1, percentage] = collidableBody.closestEdgeOfPoint(point)

                let normal = point_0.position.to(point_1.position).normal()

                point_0.position.add(point_0.position.to(point.position).projectOn(normal).multS(quadBezier([.5], [.4], [0], percentage)[0]))

                point_1.position.add(point_0.position.to(point.position).projectOn(normal).multS(quadBezier([0], [.4], [.5], percentage)[0]))

                point.position.copy(point.position.clone().add(point.position.to(point_0.position).projectOn(normal)))

                let segmentAverageVelocity = point_0.velocity.clone().add(point_1.velocity).divS(-2).projectOn(normal)

                let pointVelocity = point.velocity.clone().projectOn(normal).multS(-1)

                let segmentFix = segmentAverageVelocity.clone().add(pointVelocity.clone().divS(2))

                let pointFix = pointVelocity.clone().add(segmentAverageVelocity.clone().divS(2))

                point_0.velocity.add(segmentFix)
                point_1.velocity.add(segmentFix)

                point.velocity.add(pointFix)

            }
        }

    }

    export interface IntegrableBody {

        integrate: (dt: number) => void

        getPoints(): Point[]

    }

    export interface CollidableBody {

        containsPoint(point: Point): boolean

        closestEdgeOfPoint(point: Point): [Point, Point, number]

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

        getPoints(): Point[] {
            return [this]
        }

        integrate(dt: number) {

            this.position
                .add(this.velocity.clone().multS(dt))
                .add(this.acceleration.clone().multS(dt * dt * .5))

            this.velocity.add(this.acceleration.clone().multS(dt))

        }

    }

    export class Shape extends GameObject implements IntegrableBody, CollidableBody {

        points: Point[]

        constructor(points: Point[]) {

            super()

            if (points.length < 3) throw 'Shape cannot have less than 3 points'


            this.addTag('SB.Shape')

            this.points = points

        }

        getPoints(): Point[] {
            return this.points
        }

        integrate(dt) {

            for (let point of this.points)
                point.integrate(dt)

        }

        containsPoint(point: Point): boolean {

            return new Polygon(this.points.map(point => point.position)).containsVector(point.position)

        }

        distancePointToEdge(point: Vector, [A, B]: [Vector, Vector]): number {

            let vec = A.to(point)
            let seg = A.to(B)
            let seglen = seg.length()

            let projection = vec.dot(seg) / seglen

            if (projection < 0)
                return point.distanceTo(A)
            else if (projection > seglen)
                return point.distanceTo(B)
            else
                return vec.projectOn(seg.normal()).length()

        }

        closestEdgeOfPoint(point: Point): [Point, Point, number] {

            let closestSegment_0: number = -1
            let closestSegment_1: number = -1
            let percentage: number = 0
            let minLength: number = -1

            for (let index = 0; index < this.points.length; index++) {

                let index_0 = index
                let index_1 = (index + 1) % this.points.length

                let p0 = this.points[index_0]
                let p1 = this.points[index_1]

                let dist = this.distancePointToEdge(point.position, [p0.position, p1.position])

                if (closestSegment_0 === -1 || dist < minLength) {

                    closestSegment_0 = index_0
                    closestSegment_1 = index_1

                    let dirVector = point.position.to(p0.position).projectOn(p0.position.to(p1.position).normal())

                    let intersection = point.position.clone().add(dirVector)

                    let l0 = this.points[closestSegment_0].position.distanceTo(intersection)
                    let l1 = this.points[closestSegment_0].position.distanceTo(this.points[closestSegment_1].position)

                    percentage = l1 === 0 ? 0 : l0 / l1
                    minLength = dist

                }

            }

            return [this.points[closestSegment_0], this.points[closestSegment_1], percentage]

        }

    }

    export interface Constraint {

        applyConstraint: () => void

    }

    export class Spring implements Constraint {

        static stiffness: number = 100
        static damping: number = 1

        point_0: Point
        point_1: Point

        stiffness: number
        damping: number
        restLength: number

        constructor(point_0: Point, point_1: Point, stiffness: number = Spring.stiffness, damping: number = Spring.damping, restLength?: number) {

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
            if (this.point_0.position.distanceTo(this.point_1.position) === 0) return

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

    export class Frame extends Shape implements IntegrableBody, Constraint, CollidableBody {

        structure: Point[] = []
        springs: Spring[] = []

        constructor(points: Point[], freeze: boolean = false, springStiffness?: number, springDamping?: number) {

            super(points)

            for (let point of this.points) {

                let framePoint = new Point(point.position.clone())
                framePoint.freeze = freeze

                this.structure.push(framePoint)

                let spring = new Spring(point, framePoint, springStiffness, springDamping, 0)
                this.springs.push(spring)

            }

        }

        applyConstraint() {

            for (let spring of this.springs)
                spring.applyConstraint()

        }

    }

}