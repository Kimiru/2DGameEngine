import {
    GameEngine, GameScene, GameObject,
    Timer, FPSCounter, Input, Graph, Vector,
    Camera, Rectangle, Polygon, Segment, Ray, RayCastShadow, Drawable, Path
} from './js/2DGameEngine.js'

let unit = 20
let charunit = unit - 4

class Tile extends Drawable {

    segments = []

    constructor(x, y, image) {

        super(image)

        this.tags.push('segments')
        this.tags.push('tiles')

        this.position.set(x, y)
        this.zIndex = -1
        this.scale.set(unit, unit)
    }


}

class Walkable extends Tile {

    adjacentTiles = []

    constructor(x, y, image) {

        super(x, y, image)

        this.tags.push('walkable')

    }

    onAdd() {

        this.bakeWalkable()

    }

    onRemove() {

        for (let tile of this.adjacentTiles)
            tile.bakeWalkable()

        this.adjacentTiles = []

    }

    bakeWalkable() {

        if (!this.scene) return

        let previousAdjacentTiles = this.adjacentTiles

        this.adjacentTiles = this.scene.getTags('tiles').filter(obj => {
            return (obj.position.x == this.position.x && (obj.position.y == this.position.y + unit || obj.position.y == this.position.y - unit)) ||
                (obj.position.y == this.position.y && (obj.position.x == this.position.x + unit || obj.position.x == this.position.x - unit))
        })

        if (previousAdjacentTiles.length !== this.adjacentTiles.length) for (let tile of this.adjacentTiles)
            tile.bakeWalkable()

    }

}

class Wall extends Tile {

    constructor(x, y, image) {

        super(x, y, image)


        this.zIndex = 1
        this.scale.set(unit, unit / 4)

        this.segments.push(new Segment(new Vector(-.5, 0), new Vector(.5, 0)))

        this.add(...this.segments)

        this.tags.push('unwalkable')
        this.tags.push('nonvisible')

    }

}


class Character extends Drawable {

    static selected = null

    path = null
    shadow
    graph = new Graph()
    segments = []

    constructor(x, y, image) {

        super(image)

        this.tags.push('characters', 'unwalkable')

        this.position.set(x, y)
        this.scale.set(charunit, charunit)
        this.zIndex = 9

        this.shadow = new Shadow(this)

    }

    get segments() {

        let rect = new Rectangle(0, 0, 1, 1)
        rect.parent = this

        return rect.getPolygon().getSegments()

    }

    select() { Character.selected = this }

    updateGraph() {

        this.graph = new Graph()

        let walkables = this.scene.getTags('walkable')
        let walls = this.scene.getTags('unwalkable').filter(o => o !== this).map(o => o.segments).flat()

        for (let walkable of walkables) {

            this.graph.addNode([walkable.id, walkable])

            for (let adjacentWalkable of walkable.adjacentTiles) {

                this.graph.addNode([adjacentWalkable.id, adjacentWalkable])

                let segment = new Segment(walkable.position.clone(), adjacentWalkable.position.clone())

                if (!walls.some(seg => segment.intersect(seg)))
                    this.graph.addLink({ source: walkable.id, target: adjacentWalkable.id })

            }

        }

        for (let walkable of walkables) {

            for (let secondWalkable_1 of walkable.adjacentTiles)
                for (let secondWalkable_2 of walkable.adjacentTiles) {

                    if (secondWalkable_1 === secondWalkable_2) continue

                    for (let finalWalkable of secondWalkable_1.adjacentTiles) {

                        if (walkable === finalWalkable) continue

                        if (this.graph.hasLink(walkable.id, secondWalkable_1.id) &&
                            this.graph.hasLink(walkable.id, secondWalkable_2.id) &&
                            this.graph.hasLink(secondWalkable_1.id, finalWalkable.id) &&
                            this.graph.hasLink(secondWalkable_2.id, finalWalkable.id)
                        ) {

                            this.graph.addLink({ source: walkable.id, target: finalWalkable.id })

                        }

                    }

                }

        }

    }

    onAdd() {

        this.scene.add(this.shadow)

    }

    onRemove() {

        this.scene.remove(this.shadow)

    }

    update(dt) {

        if (Character.selected === this) {

            let mouse = this.engine.input.mouse

            if (mouse.leftClick && this.path === null) {

                let currentTile = this.scene.getTags('walkable').find(obj => obj.box.contains(this.position))
                let tile = this.scene.getTags('walkable').find(obj => obj.box.contains(mouse.position))

                if (tile) {

                    let path = this.graph.getShortestPathBetween(currentTile.id, tile.id, (a, b) => a.position.distanceTo(b.position))
                    this.path = new Path(path.map(id => this.graph.nodesObjects.get(id).position))

                }
            }

        }

        if (this.path) {

            if (!this.path.end()) {

                this.position.copy(this.path.follow(40 * dt))

            } else {

                this.path = null

            }



        }

        let segments = this.scene.getTags('nonvisible').map(o => o.segments).flat()
        this.shadow.compute(segments)

        return true

    }

}

class Shadow extends RayCastShadow {

    object

    constructor(object) {

        super()

        this.object = object
        this.zIndex = 10

    }

    update(dt) {

        if (this.display) {

            this.position.copy(this.object.position)

        }

    }

}

export { Tile, Wall, Walkable, Character, unit }