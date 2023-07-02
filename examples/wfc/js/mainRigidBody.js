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

let p0 = new SoftBody.Point(new Vector(-2, 5), undefined, undefined, true)
let p2 = new SoftBody.Point(new Vector(2, 5), undefined, undefined, true)
let p1 = new SoftBody.Point(new Vector(0, 0))

let spring = new SoftBody.Spring(p0, p1, 100, 2)
let spring2 = new SoftBody.Spring(p2, p1, 100, 2)

solver.addConstraint(spring, spring2)
solver.addIntegrableBody(p1)

scene.update = (dt) => {

    let input = scene.engine.input

    p1.acceleration.set(0, -1)

    if (input.isDown('Space'))
        p1.acceleration.addS(-5, -50)

}

scene.draw = (ctx) => {

    ctx.fillStyle = 'blue'

    ctx.beginPath()
    ctx.arc(p0.position.x, p0.position.y, .2, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(p1.position.x, p1.position.y, .2, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(p2.position.x, p2.position.y, .2, 0, Math.PI * 2)
    ctx.fill()

}