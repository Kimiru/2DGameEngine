import { GameEngine, GameScene, WFC, WaveFunctionCollapse, fullScreen, } from "../../../js/2DGameEngine.js"
import { Grid } from "./Grid.js"
import { SolutionDrawer } from "./SolutionDrawer.js"

let width = 30
let height = 30

let size = Math.max(width, height)

let engine = new GameEngine({
    width: width,
    height: height,
    verticalPixels: size,
    canvas: document.querySelector('canvas'),
})

fullScreen(engine)

let scene = new GameScene()

scene.add(new Grid(width, height))

let wfc = new WaveFunctionCollapse()

wfc.addConnector({
    id: 0, connectors: [
        { side: WFC.Side.TOP, connection: [0, 0, 0] },
        { side: WFC.Side.TOP, connection: [1, 1, 1] }
    ],
    allDirection: true
})

wfc.addConnector({
    id: 1, connectors: [
        { side: WFC.Side.TOP, connection: [1, 1, 1] },
        { side: WFC.Side.TOP, connection: [2, 2, 2] }
    ],
    allDirection: true
})

wfc.addConnector({
    id: 2, connectors: [
        { side: WFC.Side.TOP, connection: [2, 2, 2] },
        { side: WFC.Side.TOP, connection: [3, 3, 3] }
    ],
    allDirection: true
})

wfc.addConnector({
    id: 3, connectors: [
        { side: WFC.Side.TOP, connection: [3, 3, 3] },
        { side: WFC.Side.TOP, connection: [4, 4, 4] }
    ],
    allDirection: true
})

wfc.addConnector({
    id: 4, connectors: [
        { side: WFC.Side.TOP, connection: [4, 4, 4] },
        { side: WFC.Side.TOP, connection: [5, 5, 5] }
    ],
    allDirection: true
})

let solution = wfc.createSolution(width, height)

wfc.buildLookupTable()

console.log(wfc.connectorsLookupTable)

console.log(solution)

wfc.surround(solution, 3)

// wfc.fullCollapse(solution, 0, 0)


scene.add(new SolutionDrawer(solution, wfc))

engine.setScene(scene)
engine.start()
globalThis.engine = engine