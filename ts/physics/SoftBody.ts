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
                    if (collidableBody as any !== integrableBody) {
                        let frixion: number
                        let absorption: number

                        if ('frixion' in integrableBody && 'absorption' in integrableBody) {

                            frixion = Math.min(
                                integrableBody.frixion as number,
                                collidableBody.frixion
                            )

                            absorption = Math.max(
                                integrableBody.absorption as number,
                                collidableBody.absorption
                            )

                        } else {

                            frixion = collidableBody.frixion
                            absorption = collidableBody.absorption

                        }

                        for (let point of integrableBody.getPoints())
                            this.resolveCollision(point, collidableBody, frixion, absorption)

                    }

        }

        resolveCollision(point: Point, collidableBody: CollidableBody, frixion: number = collidableBody.frixion, absorption: number = collidableBody.absorption) {
            if (collidableBody.containsPoint(point)) {

                let AB = collidableBody.closestEdgeOfPoint(point)

                this.resolveEdgeCollision(point, AB)

                this.resolveEdgeCollisionVelocity(point, AB, frixion, absorption)

            }
        }

        resolveEdgeCollision(P: Point, [A, B]: [Point, Point]) {

            this.resolveEdgeCollisionPosition(P, [A, B])

        }

        resolveEdgeCollisionPosition({ position: P }: Point, [{ position: A }, { position: B }]: [Point, Point]) {

            let normal = A.to(B).normal()

            let dir = P.to(B).projectOn(normal)

            P.add(dir.clone().multS(2.1 / 3))
            dir.multS(-1 / 3)
            A.add(dir)
            B.add(dir)

        }

        resolveEdgeCollisionVelocity(P: Point, [A, B]: [Point, Point], frixion, absorption) {

            let tangent = A.position.to(B.position)
            let normal = tangent.normal()

            let edgeVelocity = A.velocity.clone().add(B.velocity).divS(2)
            let edgeTangentVelocity = edgeVelocity.projectOn(tangent)
            let edgeNormalVelocity = edgeVelocity.projectOn(normal)

            let pointTangentVelocity = P.velocity.projectOn(tangent)
            let pointNormalVelocity = P.velocity.projectOn(normal)

            P.velocity.copy(edgeNormalVelocity.multS(1 - absorption))
                .add(pointTangentVelocity.multS(1 - frixion))

            A.velocity.copy(pointNormalVelocity.multS(1 - absorption))
                .add(edgeTangentVelocity.multS(1 - frixion))
            B.velocity.copy(A.velocity)

        }

    }

    export interface IntegrableBody {

        integrate: (dt: number) => void

        getPoints(): Point[]

    }

    export interface CollidableBody {

        absorption: number
        frixion: number

        containsPoint(point: Point): boolean

        closestEdgeOfPoint(point: Point): [Point, Point]

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

            this.acceleration.set(0, 0)

        }

    }

    export class Shape extends GameObject implements IntegrableBody, CollidableBody {

        points: Point[]

        frixion: number = 1
        absorption: number = 0

        constructor(points: Point[], frixion: number = 1, absorption: number = 0) {

            super()

            if (points.length < 3) throw 'Shape cannot have less than 3 points'


            this.addTag('SB.Shape')

            this.points = points

            this.frixion = frixion
            this.absorption = absorption

        }

        getPoints(): Point[] {
            return this.points
        }

        getPointsCenter() {

            return computeCenter(this.points)

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

        closestEdgeOfPoint(point: Point): [Point, Point] {

            let closestSegment_0: number = -1
            let closestSegment_1: number = -1
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

                    minLength = dist

                }

            }

            return [this.points[closestSegment_0], this.points[closestSegment_1]]

        }

        addForce(force: Vector) {

            for (let point of this.points)
                point.acceleration.add(force)

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

            let dir = this.point_0.position.to(this.point_1.position).normalize()

            let currentLength = this.point_0.position.distanceTo(this.point_1.position)
            let deltaLength = currentLength - this.restLength

            let force = this.stiffness * deltaLength

            let damping = this.point_0.velocity.to(this.point_1.velocity).projectOn(dir).multS(this.damping)

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

        freeze: boolean = false

        structure: Point[] = []
        springs: Spring[] = []

        constructor(points: Point[], freeze: boolean = false, springStiffness?: number, springDamping?: number, frixion: number = 1, absorption: number = 0) {

            super(points)

            this.freeze = freeze
            this.frixion = frixion
            this.absorption = absorption

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

        getFrameCenter() {

            return computeCenter(this.structure)

        }

        update(dt: number): void {

            if (!this.freeze) {

                let pointsCenter = this.getPointsCenter()
                let frameCenter = this.getFrameCenter()

                let delta = frameCenter.to(pointsCenter)

                for (let point of this.structure)
                    point.position.add(delta)

                let angle = 0

                for (let [index, point] of this.points.entries()) {
                    let structPoint = this.structure[index]


                    let pointAngle = pointsCenter.to(point.position).rotate(-pointsCenter.to(structPoint.position).angle()).angle()

                    angle += pointAngle

                }

                angle /= this.points.length

                for (let point of this.structure)
                    point.position.rotateAround(pointsCenter, angle)

            }

        }

    }

    function computeCenter(points: Point[]) {

        let center = new Vector()

        if (points.length === 0) return center

        for (let point of points)
            center.add(point.position)

        center.divS(points.length)

        return center

    }

}

