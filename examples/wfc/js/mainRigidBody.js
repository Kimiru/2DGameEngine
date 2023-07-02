import { Camera, GameEngine, GameObject, GameScene, Polygon, RigitBodyComponent, Vector, fullScreen, } from "../../../js/2DGameEngine.js"

let engine = new GameEngine({
    width: width,
    height: height,
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


