import { Camera, GameEngine, GameObject, GameScene, Vector, fullScreen, } from "../../../js/2DGameEngine.js"

let width = 30
let height = 30

let size = Math.max(width, height)

let engine = new GameEngine({
    width: width,
    height: height,
    verticalPixels: size,
    canvas: document.querySelector('canvas'),
})

fullScreen(engine)

let scene = new GameScene()

scene.add()


engine.setScene(scene)
engine.start()

scene.camera = new Camera()
globalThis.engine = engine


function draw(color) {
    return (ctx) => {

        ctx.fillStyle = color
        ctx.fillRect(-1, -1, 2, 2)
    }
}

let a = new GameObject()
a.draw = draw('blue')

let b = new GameObject()
b.draw = draw('red')

b.position.set(3, 0)

scene.add(a, b)

scene.update = (dt) => {

    b.rotation += dt / 2

    scene.camera.position.copy(b.position)
    scene.camera.rotation = b.rotation

}

let v1 = new Vector(1, 1, 0)
let v2 = new Vector(1, 0, 0)
let v3 = v1.projectOn(v2)
console.log(v3.toString())