import { GameEngine, GameScene, Network, NetworkGameObject, TextureMapper, TransformMatrix } from './js/2DGameEngine.js'
import { LogScene } from './objects/LogScene.js'
import { MainScene } from './objects/MainScene.js'
import { MenuScene } from './objects/MenuScene.js'
import { SelectionScene } from './objects/SelectionScene.js'
import { WaitingRoom } from './objects/WaitingRoom.js'

window.Network = Network
window.NGO = NetworkGameObject
window.TextureMapper = TextureMapper

let engine = new GameEngine({
    width: innerWidth * .97,
    height: innerHeight * .97,
    verticalPixels: 8,
    images: [
        { name: 'mlp16', src: './images/mlp16.png' },
        { name: 'blank', src: './images/blank.png' },
        { name: 'dirt', src: './images/dirt.png' },
        { name: 'ground', src: './images/ground.png' },
        { name: 'plank', src: './images/plank.png' },
        { name: 'torchi', src: './images/torchi.png' },
        { name: 'wall', src: './images/wall.png' },
        { name: 'grid', src: './images/grid.png' },
        { name: 'door', src: './images/wooden_door.png' },
        { name: 'uparrow', src: './images/uparrow.png' },
        { name: 'downarrow', src: './images/downarrow.png' },
        { name: 'loupe', src: './images/loupe.png' },
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
engine.onResourcesLoaded(() => {

    new LogScene()
    // engine.setScene(new LogScene())
    new SelectionScene()
    new WaitingRoom()
    new MainScene()
    new MenuScene()
    engine.setScene(GameScene.list.get('MainScene'))

})

{ // Network

    Network.on(Network.events.PEER_DISCONNECT, () => { Network.reconnect() })
    Network.on(Network.events.PEER_OPENED, (id) => { console.log(`used id ${id}`) })
    Network.useWhitelist = false
}


let volume = .5

if (localStorage.getItem('volume')) {

    volume = localStorage.getItem('volume')

}

engine.soundBank.forEach(sound => sound.setVolume(volume))