import { Camera, GameEngine, GameObject, GameScene, Polygon, RigitBodyComponent, SoftBody, Vector, fullScreen, } from "../../../js/2DGameEngine.js"

let engine = new GameEngine({
    width: 30,
    height: 20,
    verticalPixels: 12,
    canvas: document.querySelector('canvas'),
})

// engine.timeScale = .1

fullScreen(engine)

let scene = new GameScene()

scene.add()

engine.setScene(scene)
engine.start()

scene.camera = new Camera()
globalThis.engine = engine


let solver = new SoftBody.Solver()

scene.add(solver)

SoftBody.Spring.stiffness = 100
SoftBody.Spring.damping = 1


let g0 = new SoftBody.Point(new Vector(-5, -2))
let g1 = new SoftBody.Point(new Vector(-6, -4))
let g2 = new SoftBody.Point(new Vector(0, -5))
let g3 = new SoftBody.Point(new Vector(6, -4))
let g4 = new SoftBody.Point(new Vector(5, -3))
let g5 = new SoftBody.Point(new Vector(0, -2))

let frame = new SoftBody.Frame([g0, g1, g2, g3, g4], true, 100, 20, 1, 1)

console.log(frame.springs.map(e => [e.stiffness, e.damping]))

// let triangle = new SoftBody.Frame([new SoftBody.Point(new Vector(0, 6.5)), new SoftBody.Point(new Vector(-2, 3)), new SoftBody.Point(new Vector(2, 3))], false, 50, 5)

let t0 = new SoftBody.Point(new Vector(0, 6.5))
let t1 = new SoftBody.Point(new Vector(-2, 3))
let t2 = new SoftBody.Point(new Vector(2, 3))

let ts = [t0, t1, t2]

ts.forEach(p => p.position.addS(-2, 0))

let triangle = new SoftBody.Shape([t0, t1, t2])

let ts0 = new SoftBody.Spring(t0, t1, 500, 10)
let ts1 = new SoftBody.Spring(t1, t2, 500, 10)
let ts2 = new SoftBody.Spring(t2, t0, 500, 10)

solver.addConstraint(frame, ts0, ts1, ts2)

solver.addIntegrableBody(frame, triangle)

solver.addCollidableBody(frame, triangle)

scene.update = (dt) => {

    for (let integrable of solver.integrableBodies) {
        for (let point of integrable.getPoints()) {

            point.acceleration.set(0, 0)

        }
        for (let point of integrable.getPoints()) {

            point.acceleration.set(0, -10)

        }


    }
    let input = scene.engine.input

    if (input.isDown('Space')) {

        triangle.points[1].velocity.set(1, 2)

    }

    if (dt > 1 / 30) console.log(dt)

}

scene.add(triangle)

scene.draw = (ctx) => {

    // for (let index = 0; index < frame.structure.length; index++) {

    //     ctx.strokeStyle = 'gray'
    //     ctx.lineWidth = .15

    //     let p0 = frame.structure[index]
    //     let p1 = frame.structure[(index + 1) % frame.structure.length]

    //     ctx.beginPath()
    //     ctx.moveTo(...p0.position.arrayXY())
    //     ctx.lineTo(...p1.position.arrayXY())
    //     ctx.stroke()

    // }

    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = .1
    for (let constraint of solver.constraints) {
        if (constraint instanceof SoftBody.Spring) {

            ctx.beginPath()
            ctx.moveTo(...constraint.point_0.position.arrayXY())
            ctx.lineTo(...constraint.point_1.position.arrayXY())
            ctx.stroke()

        }

        if (constraint instanceof SoftBody.Frame) {

            for (let spring of constraint.springs) {

                ctx.beginPath()
                ctx.moveTo(...spring.point_0.position.arrayXY())
                ctx.lineTo(...spring.point_1.position.arrayXY())
                ctx.stroke()

            }

        }

    }

    for (let integrable of solver.integrableBodies)
        for (let point of integrable.getPoints()) {
            ctx.fillStyle = 'blue'

            ctx.strokeStyle = 'blue'


            ctx.beginPath()
            ctx.arc(point.position.x, point.position.y, .11, 0, Math.PI * 2)
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