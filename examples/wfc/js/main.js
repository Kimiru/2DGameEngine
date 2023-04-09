import { GameEngine, GameScene, WFCRuleType, WaveFunctionCollapse, fullScreen, rotateWFCConnector } from "../../../js/2DGameEngine.js"
import { Grid } from "./Grid.js"
import { SolutionDrawer } from "./SolutionDrawer.js"

let width = 20
let height = 20

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

let wfc = new WaveFunctionCollapse(WFCRuleType.CONNECTOR)

wfc.addConnector({
    id: 0, constraints: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]
})
wfc.addConnector({
    id: 0, constraints: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]]
})

wfc.addConnector({
    id: 1, constraints: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]]
})
wfc.addConnector({
    id: 1, constraints: [[2, 2, 2], [2, 2, 2], [2, 2, 2], [2, 2, 2]]
})

wfc.addConnector({
    id: 2, constraints: [[2, 2, 2], [2, 2, 2], [2, 2, 2], [2, 2, 2]]
})
wfc.addConnector({
    id: 2, constraints: [[3, 3, 3], [3, 3, 3], [3, 3, 3], [3, 3, 3]]
})

wfc.addConnector({
    id: 3, constraints: [[3, 3, 3], [3, 3, 3], [3, 3, 3], [3, 3, 3]]
})
wfc.addConnector({
    id: 3, constraints: [[4, 4, 4], [4, 4, 4], [4, 4, 4], [4, 4, 4]]
})

wfc.addConnector({
    id: 4, constraints: [[4, 4, 4], [4, 4, 4], [4, 4, 4], [4, 4, 4]]
})
wfc.addConnector({
    id: 4, constraints: [[5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 5]]
})

let solution = wfc.createSolution(width, height)

wfc.buildConnectorsLookupTable()

console.log(wfc.connectorsLookupTable)

console.log(solution)

// wfc.fullCollapse(solution, 0, 0)


scene.add(new SolutionDrawer(solution, wfc))

engine.setScene(scene)
engine.start()
globalThis.engine = engine