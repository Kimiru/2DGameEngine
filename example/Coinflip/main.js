import { GameEngine } from './js/2DGameEngine'
import Player from './objects/Player'

let engine = new GameEngine()

document.body.appendChild(engine.canvas)

engine.start()



