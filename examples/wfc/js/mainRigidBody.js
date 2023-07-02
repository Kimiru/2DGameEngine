import { Camera, GameEngine, GameObject, GameScene, Polygon, RigitBodyComponent, Vector, fullScreen, } from "../../../js/2DGameEngine.js"

class Brick extends GameObject {

    rb

    constructor() {

        super()

        this.rb = new RigitBodyComponent(new Polygon([
            new Vector(-5, -5),
            new Vector(-4, -2),
            new Vector(2, 2),
            new Vector(-2, -4)
        ]), 10)

        this.add(this.rb)

    }

    update(dt) {

        this.rb.applyForce(new Vector(0, .1), new Vector(-50, 0))

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {

        this.rb.polygon.draw(ctx)

    }

}

let width = 30
let height = 30

let size = Math.max(width, height)

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

let object_1 = new Brick()




scene.add(object_1)
