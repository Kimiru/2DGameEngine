import * as GE from './js/2DGameEngine.js'

let engine = new GE.GameEngine({
    height: innerHeight * 0.9,
    width: innerWidth * 0.9,
    scaling: devicePixelRatio,
    verticalPixels: 200,
    images: [
        {
            name: 'mlp',
            src: 'images/mlp.png'
        }]
})

console.log(engine.imageBank)


document.body.appendChild(engine.canvas)

engine.start()

let box = new GE.Rectangle(0, 0, 100, 70)
let seg = new GE.Segment(new GE.Vector(-2, -5), new GE.Vector(10, 7))
let rcs = new GE.RayCastShadow(true)
rcs.zIndex = 10


let image = new GE.Drawable(engine.imageBank.get('mlp'))
image.zIndex = -1
image.scale.set(100, 100)

let segs = box.getPolygon().getSegments()
segs.shift()
rcs.position.set(-10, -10)
rcs.update = function (dt) {
    this.position.copy(this.engine.input.mouse.position)

    this.compute([...segs, seg])
}



let sc = new GE.GameScene()
sc.add(seg, ...segs)
sc.add(new GE.FPSCounter(5))
sc.add(rcs)
sc.add(image)



engine.setScene(sc)


onresize = () => {
    engine.resize(innerWidth * 0.9, innerHeight * 0.9)
}



window.engine = engine