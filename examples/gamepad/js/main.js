import { GameEngine, GamepadControl, GameScene } from '../../../js/2DGameEngine.js'
import { GamepadDisplay } from '../../../js/2DGEGui.js'

let engine = new GameEngine({

    width: 600,
    height: 400,

    scaling: devicePixelRatio,
    verticalPixels: 100,

    canvas: document.querySelector('canvas'),

    images: [],
    sounds: []

})
window.engine = engine

// engine.start()

console.log(GamepadControl)


engine.start()

let scene = new GameScene()

let gamepadDisplay = new GamepadDisplay('Calibration...', 'Pas de manette')

gamepadDisplay.transform.scale.set(90, 90)

scene.add(gamepadDisplay)
engine.setScene(scene)
