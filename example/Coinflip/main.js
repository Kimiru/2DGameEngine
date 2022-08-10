import { badclone, Camera, GameEngine, GameScene, Network, NetworkGameObject } from './js/2DGameEngine.js'
import { Player } from './objects/Player.js'

window.Network = Network
window.NGO = NetworkGameObject

let engine = new GameEngine({ width: 600, height: 400 })
window.e = engine

document.body.appendChild(engine.canvas)

engine.start()

let scene = new GameScene()
scene.store()


let player = new Player()
let cam = new Camera()

player.add(cam)
// scene.camera = cam

scene.add(player)
engine.setScene(scene)



function getid() {

    return Number(Math.floor(Math.random() * 10)).toString()

}

let id = getid()

Network.on(Network.events.PEER_ERROR, (data) => {

    console.error(data.message)

    if (/is taken/.exec(data.message)) {
        id = getid()
        Network.start(id)
    }
    if (/Lost connection to server./.exec(data.message))
        Network.start(id)

})

Network.start(id)

player.sync()

function sync(data) {


}

Network.on(Network.events.PEER_OPENED, (id) => { console.log(id) })
Network.on(Network.events.CLIENT_P2P_OPENED, sync)

Network.on(Network.events.HOST_P2P_OPENED, sync)

Network.useWhitelist = false