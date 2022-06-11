import * as GE from './js/2DGameEngine.js'

let engine = new GE.GameEngine({ height: innerHeight * 0.9, width: innerWidth * 0.9 })

document.body.appendChild(engine.getDOMElement())

engine.start()

console.log(engine)

let o1 = new GE.GameObject()
let o2 = new GE.GameObject()
let o3 = new GE.GameObject()
let o11 = new GE.GameObject()

o1.add(o2)

o1.position.x = 10
o1.z = 10

o11.scale.set(2, 2)

o1.add(o11)

o2.z = -10
o2.scale.set(2, 2)
o3.position.x = 10

o2.add(o3)

o1.draw = function (ctx) {

    ctx.fillStyle = 'red'
    ctx.fillRect(-5, -5, 10, 10)
    return true

}

o11.draw = function (ctx) {

    ctx.fillStyle = 'orange'
    ctx.fillRect(-5, -5, 10, 10)

}

o2.draw = function (ctx) {
    ctx.fillStyle = 'blue'
    ctx.fillRect(-5, -5, 10, 10)
    return true
}

o3.draw = function (ctx) {
    ctx.fillStyle = 'lightblue'
    ctx.fillRect(-5, -5, 10, 10)
}

o1.bakeTransform()
o2.bakeTransform()
o3.bakeTransform()

let sc = new GE.GameScene()
sc.add(o1)
sc.add(o2)

engine.setScene(sc)

console.log(o3.getWorldPosition())
console.log(o3.getWorldRotation())

onresize = () => {
    engine.resize(innerWidth * 0.9, innerHeight * 0.9)
}


window.engine = engine