import { Camera, GameEngine, GameObject, GameScene, Polygon, RigitBodyComponent, SoftBody, Vector, fullScreen, } from "../../../js/2DGameEngine.js"

let engine = new GameEngine({
    width: 30,
    height: 20,
    verticalPixels: 12,
    canvas: document.querySelector('canvas'),
})

fullScreen(engine)

let scene = new GameScene()

scene.add()

engine.setScene(scene)
engine.start()

scene.camera = new Camera()
globalThis.engine = engine


let solver = new SoftBody.Solver()

scene.add(solver)

SoftBody.Spring.stiffness = 150
SoftBody.Spring.damping = 10

let leftLock = new SoftBody.Point(new Vector(-5, 0))
let rightLock = new SoftBody.Point(new Vector(5, 0))

let g0 = new SoftBody.Point(new Vector(-5, -2))
let g1 = new SoftBody.Point(new Vector(-5, -5))
let g2 = new SoftBody.Point(new Vector(0, -5))
let g3 = new SoftBody.Point(new Vector(5, -5))
let g4 = new SoftBody.Point(new Vector(5, -2))
let g5 = new SoftBody.Point(new Vector(0, -2))

let leftLockSpring = new SoftBody.Spring(leftLock, g0, 250, 20, 0)
let rightLockSpring = new SoftBody.Spring(rightLock, g4, 250, 20, 0)

let s0 = new SoftBody.Spring(g0, g1, undefined, 2)
let s1 = new SoftBody.Spring(g1, g2, undefined, 2)
let s2 = new SoftBody.Spring(g2, g3, undefined, 2)
let s3 = new SoftBody.Spring(g3, g4, undefined, 2)
let s4 = new SoftBody.Spring(g4, g5, undefined, 2)
let s5 = new SoftBody.Spring(g5, g0, undefined, 2)

let s6 = new SoftBody.Spring(g0, g2, undefined, 2)
let s7 = new SoftBody.Spring(g2, g4, undefined, 2)
let s8 = new SoftBody.Spring(g1, g5, undefined, 2)
let s9 = new SoftBody.Spring(g3, g5, undefined, 2)
let s10 = new SoftBody.Spring(g2, g5, undefined, 2)

let brick = new SoftBody.Shape([g0, g1, g2, g3, g4, g5])

let t0 = new SoftBody.Point(new Vector(0, 5))
let t1 = new SoftBody.Point(new Vector(-2, 3))
let t2 = new SoftBody.Point(new Vector(2, 3))

let triangle = new SoftBody.Shape([t0, t1, t2])

let ts0 = new SoftBody.Spring(t0, t1, 1000, 50)
let ts1 = new SoftBody.Spring(t1, t2, 1000, 50)
let ts2 = new SoftBody.Spring(t2, t0, 1000, 50)

solver.addConstraint(s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, leftLockSpring, rightLockSpring, ts0, ts1, ts2)

solver.addIntegrableBody(brick, triangle)

solver.addCollidableBody(brick)

scene.update = (dt) => {

    for (let integrable of solver.integrableBodies)
        for (let point of integrable.getPoints()) {

            point.acceleration.set(0, -10)

        }

    let input = scene.engine.input

    if (dt > 1 / 30) console.log(dt)

}

scene.draw = (ctx) => {

    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = .1
    for (let constraint of solver.constraints)
        if (constraint instanceof SoftBody.Spring) {

            ctx.beginPath()
            ctx.moveTo(...constraint.point_0.position.arrayXY())
            ctx.lineTo(...constraint.point_1.position.arrayXY())
            ctx.stroke()

        }



    for (let integrable of solver.integrableBodies)
        for (let point of integrable.getPoints()) {
            ctx.fillStyle = 'blue'

            if (point === t1) {
                let body
                if (body = solver.collidableBodies.find(body => body.containsPoint(t1))) {

                    ctx.strokeStyle = 'green'
                    ctx.lineWidth = .3

                    let [p0, p1] = body.closestEdgeOfPoint(point)

                    ctx.beginPath()
                    ctx.moveTo(...p0.position.arrayXY())
                    ctx.lineTo(...p1.position.arrayXY())
                    ctx.stroke()

                    ctx.fillStyle = 'orange'
                    ctx.lineWidth = .1

                }
            }
            ctx.strokeStyle = 'blue'


            ctx.beginPath()
            ctx.arc(point.position.x, point.position.y, .2, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(...point.position.arrayXY())
            ctx.lineTo(...point.position.clone().add(point.velocity).arrayXY())
            ctx.stroke()

        }

    ctx.strokeStyle = 'red'
    for (let integrable of solver.integrableBodies)

        if (integrable instanceof SoftBody.Shape) {

            let pts = integrable.getPoints()

            for (let i = 0; i < pts.length; i++) {

                let p0 = pts[i]
                let p1 = pts[(i + 1) % pts.length]

                ctx.beginPath()
                ctx.moveTo(...p0.position.arrayXY())
                ctx.lineTo(...p1.position.arrayXY())
                ctx.stroke()

            }

        }


}