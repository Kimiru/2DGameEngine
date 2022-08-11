import { GameEngine, Network, NetworkGameObject } from './js/2DGameEngine.js'
import { LogScene } from './objects/LogScene.js'

window.Network = Network
window.NGO = NetworkGameObject

let engine = new GameEngine({
    width: innerWidth * .97,
    height: innerHeight * .97,
    verticalPixels: 200,
    images: [

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
