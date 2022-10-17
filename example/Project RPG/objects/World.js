import { Drawable, GameObject, GameScene, Graph, NetworkGameObject, Path, RenderingStyle, Segment, Vector } from "../js/2DGameEngine.js";

class InterLayer extends GameObject {

    constructor() {

        super()

    }

    physics(dt) {

        this.position.copy(this.scene.camera.getWorldPosition())
        this.scale.set(this.engine.usableWidth * this.scene.camera.scale.x, this.engine.usableHeight * this.scene.camera.scale.y)

    }

    draw(ctx) {

        ctx.fillStyle = '#000000a0'
        ctx.fillRect(-.5, -.5, 1, 1)

    }

}

export class WorldEntity extends GameObject {

    owner = []
    drawRange = 1

    constructor() {

        super()

        this.addTag('worldEntity')
        this.addTag('semi-solid')

        this.image = new Drawable(window.engine.imageBank.get('mlp16'))
        this.image.scale.set(.7, .7)
        this.add(this.image)

    }

    get blockedPosition() {

        if (this.path)
            return this.path.points[this.path.points.length - 1].clone()
        else
            return this.position.clone()
    }

    update(dt) {

        if (this.path) {

            if (!this.path.end()) {

                this.position.copy(this.path.follow(1.5 * dt))

            } else {

                this.path = null

            }


        }

    }

    getLayer() { return Math.round(this.zIndex / 10) }

}

export class SemiSolid extends GameObject {
    drawRange = 1

    constructor(layer = 0) {

        super()

        this.addTag('semi-solid')
        this.zIndex = layer * 10 - 2

    }

    get blockedPosition() {
        return this.position.clone()
    }

}

export class NonSolid extends GameObject {
    drawRange = 1

    constructor(layer = 0) {

        super()

        this.addTag('non-solid')
        this.zIndex = layer * 10 - 3

    }

}
export class Solid extends GameObject {
    drawRange = 1

    constructor(layer = 0) {

        super()

        this.addTag('solid')
        this.zIndex = layer * 10 - 2

    }

}

export class Wall extends Segment {
    drawRange = 1

    constructor(layer = 0, position = new Vector(0, 0), orientation = 'h', textureName = 'wall') {

        super(new Vector(-.5, 0), new Vector(.5, 0))

        this.addTag('wall')

        this.zIndex = layer * 10

        this.position.copy(position)
        this.lineWidth = .1

        if (orientation === 'v') {

            this.rotation = Math.PI / 2

        }

        this.image = new Drawable(window.engine.imageBank.get(textureName))
        this.image.scale.set(1 + 2 / 16, 2 / 16)
        this.add(this.image)

    }

}

export class Door extends Wall {

    opened = false

    constructor(layer = 0, position = new Vector(0, 0), orientation = 'h', textureName = 'door') {

        super(layer, position, orientation, textureName)

        this.addTag('door')
        this.removeTag('wall')

        this.image.scale.set(7 / 8, 1 / 4)
        this.remove(this.image)

    }

    toggle() { this.opened = !this.opened }

    draw(ctx) {

        if (this.opened) {

            ctx.fillStyle = '#00000070'
            ctx.fillRect(-7 / 16, -1 / 16, 7 / 8, 1 / 8)

        } else
            this.image.executeDraw(ctx)

    }

}

export class Floor extends GameObject {

    adjacentTiles = []
    image
    drawRange = 1

    constructor(layer = 0, textureName = 'dirt') {

        super()

        this.addTag('floor')
        this.zIndex = layer * 10 + -4

        this.image = new Drawable(window.engine.imageBank.get(textureName))
        this.add(this.image)

    }

    onAdd() {

        this.cook()

    }

    onRemove() {

        this.adjacentTiles.forEach(o => o.cook())

    }

    draw(ctx) {

    }

    cook() {

        if (!this.scene) return

        let previousAdjacentTiles = this.adjacentTiles

        let unit = 1

        this.adjacentTiles = this.scene.getTags('floor').filter(sameLayer(Math.round(this.zIndex / 10))).filter(obj => {
            return (obj.position.x == this.position.x && (obj.position.y == this.position.y + unit || obj.position.y == this.position.y - unit)) ||
                (obj.position.y == this.position.y && (obj.position.x == this.position.x + unit || obj.position.x == this.position.x - unit))
        })

        if (previousAdjacentTiles.length !== this.adjacentTiles.length) for (let tile of this.adjacentTiles)
            tile.cook()

    }

}

export class LayerChanger extends Floor {

    direction
    amount
    arrow

    constructor(layer = 0, direction = 1, amount = 1, textureName = 'dirt') {

        super(layer, textureName)

        this.addTag('layerchanger')

        this.direction = direction
        this.amount = amount

        this.zIndex = layer * 10 + -1

        this.drawAfterChildren()

        this.arrow = new Drawable((direction > 0 ? window.engine.imageBank.get('uparrow') : window.engine.imageBank.get('downarrow')))

    }


    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {

        super.draw(ctx)

        this.arrow.executeDraw(ctx)
    }

}

let Type = {

    ENTITY: 0,
    FLOOR: 1,
    DOOR: 2,

}

let unit = 1 / 16

export class World extends NetworkGameObject {

    name
    interLayers = []

    drawRange = Infinity
    renderingStyle = RenderingStyle.IN_VIEW

    #minLayer = 0
    #maxLayer = 0

    currentLayer = 0
    selectedEntity = null

    dummy = new GameObject()

    loupe

    static object

    constructor() {

        super()

        World.object = this

        this.add(this.dummy)

        this.loupe = new Drawable(window.engine.imageBank.get('loupe'))
        this.loupe.scale.set(30 * unit, 30 * unit)

        this.drawAfterChildren()

    }

    get minLayer() { return this.#minLayer }
    get maxLayer() { return this.#maxLayer }

    cook() {

        this.#minLayer = Math.round(this.children.map(o => o.zIndex).reduce((a, b) => Math.min(a, b), 0) / 10)
        this.#maxLayer = Math.round(this.children.map(o => o.zIndex).reduce((a, b) => Math.max(a, b), 0) / 10)

        this.interLayers.forEach(o => o.kill())
        this.interLayers = []

        for (let layer = this.#minLayer; layer < this.#maxLayer; layer++) {

            let interLayer = new InterLayer()
            interLayer.zIndex = layer * 10 + 5

            this.interLayers.push(interLayer)
            this.add(interLayer)
        }

        console.log(`cooked ${this.#maxLayer - this.#minLayer + 1} layers and ${this.#maxLayer - this.#minLayer} interLayers`)

    }

    childrenDrawFilter(children = []) {

        return children.filter(o => o.zIndex < this.currentLayer * 10 + 5)

    }

    update(dt) {

        let mouse = this.input.mouse

        if (mouse.leftClick) {

            console.log(mouse.position)

            let menubutton = this.scene.getTags('menubutton')[0]

            if (menubutton.rect.containsWorldVector(mouse.position)) {
            }

            else {

                let result = this.findObject(mouse.position, this.currentLayer)

                if (result.type === Type.DOOR) {

                    let door = result.object

                    door.toggle()

                } else if (result.type === Type.ENTITY) {

                    let entity = result.object

                    this.selectEntity(entity)

                } else if (result.type === Type.FLOOR) {

                } else {

                    if (this.selectedEntity && !this.selectedEntity.path) {

                        let path = this.pathOfEntityToPosition(this.selectedEntity, mouse.position)
                        this.selectedEntity.path = path

                    } else {

                        this.selectedEntity = null
                        this.track(mouse.position.clone().round())

                    }

                }

            }
        }

        if (this.selectedEntity)
            this.track(this.selectedEntity)

        if (this.input.isPressed('ArrowDown'))
            this.scene.camera.scale.addS(1 / 8, 1 / 8)
        if (this.input.isPressed('ArrowUp')) if (this.scene.camera.scale.x > 1 / 8)
            this.scene.camera.scale.subS(1 / 8, 1 / 8)

    }

    floorAt(vec, layer) {

        return this.scene.getTags('floor')
            .filter(sameLayer(layer))
            .find(o => o.position.equal(vec))

    }

    /**
     * 
     * @param {WorldEntity} entity 
     * @returns 
     */
    getGraphForEntity(entity) {

        let layer = entity.getLayer()

        let graph = new Graph(true, o => o.position.clone())

        let walkables = this.scene.getTags('floor').filter(sameLayer(layer))
        let walls = this.scene.getTags('wall').filter(sameLayer(layer))
        let doors = this.scene.getTags('door').filter(o => !o.opened).filter(sameLayer(layer))

        let segments = [...walls, ...doors]

        for (let walkable of walkables) {

            graph.addNode([walkable.id, walkable])

            for (let adjacentWalkable of walkable.adjacentTiles) {

                graph.addNode([adjacentWalkable.id, adjacentWalkable])

                let segment = new Segment(walkable.position.clone(), adjacentWalkable.position.clone())

                if (!segments.some(seg => segment.intersect(seg)))
                    graph.addLink({ source: walkable.id, target: adjacentWalkable.id })

            }

        }

        for (let walkable of walkables) {

            for (let secondWalkable_1 of walkable.adjacentTiles)
                for (let secondWalkable_2 of walkable.adjacentTiles) {

                    if (secondWalkable_1 === secondWalkable_2) continue

                    for (let finalWalkable of secondWalkable_1.adjacentTiles) {

                        if (walkable === finalWalkable) continue

                        if (graph.hasLink(walkable.id, secondWalkable_1.id) &&
                            graph.hasLink(walkable.id, secondWalkable_2.id) &&
                            graph.hasLink(secondWalkable_1.id, finalWalkable.id) &&
                            graph.hasLink(secondWalkable_2.id, finalWalkable.id)
                        ) {

                            graph.addLink({ source: walkable.id, target: finalWalkable.id })

                        }

                    }

                }

        }

        this.scene.getTags('semi-solid').filter(sameLayer(layer)).forEach(object => {
            if (object !== entity) {
                graph.removeNode(this.floorAt(object.blockedPosition, layer)?.id)
            }
        })

        return graph

    }

    pathOfEntityToPosition(entity, position) {

        position = position.clone().round()

        let graph = this.getGraphForEntity(entity)

        let path = graph.getShortestPathBetween(
            this.floorAt(entity.position.clone().round(), this.selectedEntity.getLayer())?.id,
            this.floorAt(position, entity.getLayer())?.id,
            (a, b) => a.position.distanceTo(b.position)
        )?.map(id => graph.nodesObjects.get(id).position.clone())

        if (path)
            return new Path(path)

        return null

    }

    getSource() {

        let res = { name: this.name }

        return res

    }

    source(source) {

        this.name = source.name

    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {

        if (this.selectedEntity && !this.selectedEntity.path) {

            this.loupe.position.copy(this.selectedEntity.position)
            this.loupe.executeDraw(ctx)

            // ctx.strokeStyle = 'red'
            // ctx.lineWidth = .1
            // ctx.beginPath()
            // ctx.ellipse(this.selectedEntity.position.x, this.selectedEntity.position.y, .6, .6, 0, 0, 2 * Math.PI)
            // ctx.stroke()

            let floorChanger = this.scene.getTags('layerchanger').filter(sameLayer(this.selectedEntity.getLayer())).find(o => o.position.distanceTo(this.selectedEntity.position) < .1)

            if (floorChanger) {

                // console.log(floorChanger)

            }

        }

    }

    click(user, position) {

        position = new Vector().copy(position)

    }

    findObject(position = new Vector(), layer = 0) {

        position = position.clone()

        let door = this.scene.getTags('door')
            .filter(sameLayer(layer))
            .find(o => o.position.distanceTo(position) < 2 * unit)

        if (door) return { object: door, type: Type.DOOR }

        position.round()

        let entity = this.scene.getTags('worldEntity')
            .filter(sameLayer(layer))
            .find(o => o.position.equal(position))

        if (entity) return { object: entity, type: Type.ENTITY }

        // let floor = this.scene.getTags('floor')
        //     .filter(sameLayer(layer))
        //     .find(o => o.position.equal(position))

        // if (floor) return { object: floor, type: Type.FLOOR }

        return { object: null, type: null }

    }

    selectEntity(entity) {

        if (this.selectedEntity === entity) {

            this.track(this.selectedEntity.position)
            this.selectedEntity = null

        } else {

            this.selectedEntity = entity
            this.track(this.selectedEntity)

        }

    }

    track(target) {

        if (target instanceof Vector) {

            this.dummy.position.copy(target)
            this.scene.camera.trackedObject = this.dummy

        }

        if (target instanceof GameObject) {

            this.scene.camera.trackedObject = target
            this.currentLayer = Math.round(target.zIndex / 10)

        }

    }

    moveEntity(user, entityPosition, targetPosition) {

        position = new Vector().copy(position)


    }

}

function sameLayer(layer) {

    return function (o) { return Math.round(o.zIndex / 10) === layer }

}