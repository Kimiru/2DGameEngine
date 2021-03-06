import * as GE from './js/2DGameEngine.js'
import { Tile, Wall, Walkable, Character, unit } from './objects.js'

let engine = new GE.GameEngine({
    height: innerHeight * 0.9,
    width: innerWidth * 0.9,
    scaling: devicePixelRatio,
    verticalPixels: unit * 10,
    images: [
        {
            name: 'mlp',
            src: 'images/mlp.png'
        },
        {
            name: 'plank',
            src: 'images/plank.png'
        },
        {
            name: 'wall',
            src: 'images/torchi_small.png'
        }]
})

console.log(engine.imageBank)


document.body.appendChild(engine.canvas)

engine.start()
let sc = new GE.GameScene()



sc.add(new GE.FPSCounter(5))

for (let i = -3; i < 4; i++) {
    for (let j = -3; j < 4; j++) {
        let tile = new Walkable(i * unit, j * unit, engine.imageBank.get('plank'))
        sc.add(tile)
    }
}

for (let i = -3; i < 3; i += 2) {
    let wall = new Wall(0, i * unit + unit / 2, engine.imageBank.get('wall'))
    sc.add(wall)
}



let character = new Character(0, 0, engine.imageBank.get('mlp'))
character.shadow.enable()
character.select()
sc.add(character)
character.updateGraph()


engine.setScene(sc)


onresize = () => {
    engine.resize(innerWidth * 0.9, innerHeight * 0.9)
}



window.engine = engine