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


let g0 = new SoftBody.Point(new Vector(-5, -2))
let g1 = new SoftBody.Point(new Vector(-5, -5))
let g2 = new SoftBody.Point(new Vector(0, -5))
let g3 = new SoftBody.Point(new Vector(5, -5))
let g4 = new SoftBody.Point(new Vector(5, -2))
let g5 = new SoftBody.Point(new Vector(0, -2))

let frame = new SoftBody.Frame([g0, g1, g2, g3, g4, g5], true, 10, 50)


let t0 = new SoftBody.Point(new Vector(0, 5))
let t1 = new SoftBody.Point(new Vector(-2, 3))
let t2 = new SoftBody.Point(new Vector(2, 3))

let triangle = new SoftBody.Shape([t0, t1, t2])

let ts0 = new SoftBody.Spring(t0, t1, 1000, 50)
let ts1 = new SoftBody.Spring(t1, t2, 1000, 50)
let ts2 = new SoftBody.Spring(t2, t0, 1000, 50)

solver.addConstraint(ts0, ts1, ts2, frame)

solver.addIntegrableBody(triangle, frame)

solver.addCollidableBody(frame, triangle)

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