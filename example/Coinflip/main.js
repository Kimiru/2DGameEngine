import { GameEngine, Network, NetworkGameObject } from './js/2DGameEngine.js'
import { LogScene } from './objects/LogScene.js'

window.Network = Network
window.NGO = NetworkGameObject

let engine = new GameEngine({
    width: innerWidth * .97,
    height: innerHeight * .97,
    verticalPixels: 200,
    images: [

    ],
    sounds: [
        { name: 'bip', srcs: ['./sounds/menubip1.wav', './sounds/menubip2.wav', './sounds/menubip3.wav'] },
        { name: 'hit', srcs: ['./sounds/hit1.wav', './sounds/hit2.wav', './sounds/hit3.wav'] },
        { name: 'explosion', srcs: ['./sounds/explosion1.wav', './sounds/explosion2.wav', './sounds/explosion3.wav'] },
        { name: 'wrong', srcs: ['./sounds/wrong.wav'] }
    ]
})
window.engine = engine
window.addEventListener('resize', _ => engine.resize(innerWidth * .97, innerHeight * .97))
document.body.appendChild(engine.canvas)

engine.start()

engine.setScene(new LogScene())

{ // Network

    Network.on(Network.events.PEER_DISCONNECT, () => { Network.reconnect() })
    Network.on(Network.events.PEER_OPENED, (id) => { console.log(`used id ${id}`) })
    Network.useWhitelist = false
}
