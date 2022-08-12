import { GameEngine, Network, NetworkGameObject, TextureMapper } from './js/2DGameEngine.js'
import { CoinFlipScene } from './objects/CoinFlipScene.js'
import { LogScene } from './objects/LogScene.js'
import { SelectionScene } from './objects/SelectionScene.js'

window.Network = Network
window.NGO = NetworkGameObject
window.TextureMapper = TextureMapper

let engine = new GameEngine({
    width: innerWidth * .97,
    height: innerHeight * .97,
    verticalPixels: 200,
    images: [
        { name: 'mlp16', src: './images/mlp16.png' },
        { name: 'colorchart_4_4', src: './images/colorchart_4_4.png' },
        { name: 'sword_4_4', src: './images/sword_4_4.png' },
        { name: 'sword_16_16', src: './images/sword_16_16.png' },

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
new SelectionScene()
new CoinFlipScene()

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






engine.onResourcesLoaded(() => {

    TextureMapper.map(engine.imageBank.get('sword_16_16'), engine.imageBank.get('colorchart_4_4'), engine.imageBank.get('sword_4_4'))

})