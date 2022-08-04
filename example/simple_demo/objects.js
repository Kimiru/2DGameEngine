import {
    GameEngine, GameScene, GameObject,
    Timer, FPSCounter, Input, Graph, Vector,
    Camera, lerp, Rectangle, Polygon, Segment, Ray, RayCastShadow, Drawable, Path, PerlinNoise, map, ImagePrinter, range
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

let drawArgs = {
    offsetX: 0,
    offsetY: 0,

    pxPerCell: 200,
    scale: 1,
    daylight: true,
    weather: false,
    temperature: false,
}

class World {

    seeds
    width
    height

    p1
    p2
    p3

    t

    weather

    constructor(seed, width = 3, height = 2) {
        if (seed == null) {

            let n0 = Math.floor(Math.random() * 1000)
            let n1 = Math.floor(Math.random() * 1000)
            let n2 = Math.floor(Math.random() * 1000)

            seed = `${n0}_${n1}_${n2}`
            console.log(seed)

        }

        this.seeds = seed.split('_').map(Number)

        this.width = width
        this.height = height

        this.p1 = new PerlinNoise(this.seeds[0], width, height)
        this.p2 = new PerlinNoise(this.seeds[1], width * 2, height * 2)
        this.p3 = new PerlinNoise(this.seeds[2], width * 4, height * 4)

        this.t = 0

        this.weather = []
        this.temperature = []

        for (let x of range(this.width * 10)) {

            let weather = []
            let temperature = []

            for (let y of range(this.height * 10)) {

                weather.push(0)
                temperature.push(5)

            }

            this.weather.push(weather)
            this.temperature.push(temperature)

        }

    }

    get(x, y) {

        let v1 = this.p1.get(x, y)
        let v2 = this.p2.get(x * 2, y * 2) / 2
        let v3 = this.p3.get(x * 4, y * 4) / 4

        let v1p = this.p1.get(x * 8, y * 8) / 8

        let res = v1 + v2 + v3 + v1p

        return map(res, -1, 1, 0, 1)

    }

    tick() {

        this.t++

        let nextTmp = this.temperature.map(e => e.map(e => 0))
        let nextWeather = this.weather.map(e => [...e])

        for (let x of range(this.temperature.length))
            for (let y of range(this.temperature[x].length)) {

                let ix = (x + .5) / 10
                let iy = (y + .5) / 10

                let tmp = this.temperature[x][y]
                let weather = this.weather[x][y]

                let daylight = this.getDaylight(ix)
                let tile = this.#mapValue((this.get(ix, iy) + 1) / 2)

                let change = 0

                if (weather == 0 && tile == 0 && tmp > 5) {
                    change--
                    nextWeather[x][y] = 1
                }

                if (daylight > .5) {
                    change++
                    if (tile != 0) change++

                }
                else change--

                if (weather) change--

                tmp += change

                tmp = Math.min(tmp, 10)
                tmp = Math.max(tmp, 0)

                nextTmp[x][y] = tmp

            }

        this.temperature = nextTmp
        this.weather = nextWeather

    }

    getDaylight(x) {

        let sunPosition = (this.t / 8 * this.width) % this.width
        let sunPosition2 = sunPosition + this.width
        let sunPosition3 = sunPosition - this.width

        let distanceToSun = Math.min(Math.abs(sunPosition - x), Math.abs(sunPosition2 - x), Math.abs(sunPosition3 - x))

        let marginMin = this.width / 4 - 0.1
        let marginMax = this.width / 4 + 0.1


        if (distanceToSun < marginMin) return 1
        if (distanceToSun < marginMax) return lerp(1, 0, map(distanceToSun, marginMin, marginMax, 0, 1))
        else return 0
    }

    getWeather(x, y) {

        x = ((x % this.width) + this.width) % this.width
        y = ((y % this.height) + this.height) % this.height

        x = Math.floor(x * 10)
        y = Math.floor(y * 10)

        return this.weather[x][y]
    }

    getTemperature(x, y) {

        x = ((x % this.width) + this.width) % this.width
        y = ((y % this.height) + this.height) % this.height

        x = Math.floor(x * 10)
        y = Math.floor(y * 10)

        return this.temperature[x][y]

    }

    #mapValue(v) {
        // water
        if (v < .8) return 0
        // sand
        else if (v < .805) return 1
        // grass
        else if (v < .87) return 2
        // stone
        else if (v < .9) return 3
        // snow
        else return 5
    }

    #mapColor(v) {
        if (v == 0) return `#00f`
        if (v == 1) return '#C2B280'
        if (v == 2) return '#008000 '
        if (v == 3) return '#858891'
        if (v == 4) return '#006600'
        if (v == 5) return '#fff'
    }


    draw(args = drawArgs) {
        args = { ...drawArgs, ...args }

        let imagePrinter = new ImagePrinter(args.pxPerCell * this.width * args.scale, args.pxPerCell * this.height * args.scale)


        for (let x = 0; x < args.pxPerCell * this.width; x++) {
            for (let y = 0; y < args.pxPerCell * this.height; y++) {

                let ix = (x + .5) / args.pxPerCell + args.offsetX
                let iy = (y + .5) / args.pxPerCell + args.offsetY

                let v = this.get(ix, iy)

                if (false) {

                    v = map(v, 0, 1, 0, 255)

                    imagePrinter.ctx.fillStyle = `rgb(${v}, ${v}, ${v})`
                }
                else {
                    v = this.#mapValue((v + 1) / 2)

                    if (v == 2) {

                        let v2 = (this.p2.get(ix * 2, iy * 2) + 1) / 2
                        if (v2 > .5) v = 4

                    }

                    imagePrinter.ctx.fillStyle = this.#mapColor(v)
                }
                imagePrinter.ctx.fillRect(x * args.scale, y * args.scale, args.scale, args.scale)

                if (args.daylight) {

                    let sunlight = this.getDaylight(ix)
                    sunlight = map(1 - sunlight, 0, 1, 0, 0.6)

                    let color = `rgba(50, 50, 50, ${sunlight})`
                    imagePrinter.ctx.fillStyle = color
                    imagePrinter.ctx.fillRect(x * args.scale, y * args.scale, args.scale, args.scale)

                }
            }
        }

        if (args.weather) {

            for (let x = 0; x < 10 * this.width; x++) {
                for (let y = 0; y < 10 * this.height; y++) {

                    let x0 = (x - .5) / 10 + args.offsetX
                    let x1 = (x + .5) / 10 + args.offsetX
                    let y0 = (y - .5) / 10 + args.offsetY
                    let y1 = (y + .5) / 10 + args.offsetY

                    let p0 = this.getWeather(x0, y0)
                    let p1 = this.getWeather(x1, y0)
                    let p2 = this.getWeather(x0, y1)
                    let p3 = this.getWeather(x1, y1)

                    let dl = map(this.getDaylight(x / 10 + args.offsetX, y / 10 + args.offsetY), 0, 1, .1, .7)


                    let size = args.pxPerCell * args.scale * 0.1
                    let ix = (x + args.offsetX) * size
                    let iy = (y + args.offsetX) * size
                    let mis = size / 2


                    imagePrinter.ctx.fillStyle = `rgba(200, 200, 200, ${dl})`

                    let ctx = imagePrinter.ctx

                    if (p0 && p1 && p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()
                    }
                    else if (p0 && p1 && !p2 && !p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + mis)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix + size, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()
                    }
                    else if (!p0 && p1 && !p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix + mis, iy)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy)
                        ctx.lineTo(ix + mis, iy)
                        ctx.fill()
                    }
                    else if (!p0 && !p1 && p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy + mis)
                        ctx.lineTo(ix, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix, iy + mis)
                        ctx.fill()
                    }
                    else if (p0 && !p1 && p2 && !p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + size)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix + mis, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()
                    }
                    else if (p0 && !p1 && !p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + mis)
                        ctx.lineTo(ix + mis, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()

                        ctx.beginPath()
                        ctx.moveTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.fill()
                    }
                    else if (!p0 && p1 && p2 && !p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix + size, iy)
                        ctx.lineTo(ix + mis, iy)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix + size, iy)
                        ctx.fill()

                        ctx.beginPath()
                        ctx.moveTo(ix, iy + size)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix, iy + mis)
                        ctx.lineTo(ix, iy + size)
                        ctx.fill()
                    }
                    else if (p0 && !p1 && !p2 && !p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + mis)
                        ctx.lineTo(ix + mis, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()
                    }
                    else if (!p0 && p1 && !p2 && !p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix + size, iy)
                        ctx.lineTo(ix + mis, iy)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix + size, iy)
                        ctx.fill()
                    }
                    else if (!p0 && !p1 && p2 && !p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy + size)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix, iy + mis)
                        ctx.lineTo(ix, iy + size)
                        ctx.fill()
                    }
                    else if (!p0 && !p1 && !p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.fill()
                    }
                    else if (p0 && p1 && p2 && !p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + size)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix + size, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()
                    }
                    else if (!p0 && p1 && p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix + size, iy)
                        ctx.lineTo(ix + mis, iy)
                        ctx.lineTo(ix, iy + mis)
                        ctx.lineTo(ix, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy)
                        ctx.fill()
                    }
                    else if (p0 && !p1 && p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy + mis)
                        ctx.lineTo(ix + mis, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()
                    }
                    else if (p0 && p1 && !p2 && p3) {
                        ctx.beginPath()
                        ctx.moveTo(ix, iy)
                        ctx.lineTo(ix, iy + mis)
                        ctx.lineTo(ix + mis, iy + size)
                        ctx.lineTo(ix + size, iy + size)
                        ctx.lineTo(ix + size, iy)
                        ctx.lineTo(ix, iy)
                        ctx.fill()
                    }

                }
            }
        }

        if (args.temperature) {

            for (let x = 0; x < 10 * this.width; x++) {
                for (let y = 0; y < 10 * this.height; y++) {

                    let ix = (x + .5) / 10 + args.offsetX
                    let iy = (y + .5) / 10 + args.offsetY

                    let t = map(this.getTemperature(ix, iy), 0, 10, 0, 1)


                    let scaling = args.pxPerCell * args.scale
                    let offset = 0.1 / 4 * scaling
                    let posx = ix * scaling - offset
                    let posy = iy * scaling - offset
                    let size = offset * 2

                    imagePrinter.ctx.fillStyle = 'rgba(255, 255, 255, 1)'

                    imagePrinter.ctx.fillRect(posx, posy, size, size)

                    imagePrinter.ctx.fillStyle = `hsla(${lerp(240, 360, t)}, 100%, 50%, .7)`

                    imagePrinter.ctx.fillRect(posx, posy, size, size)

                }
            }

        }

        return imagePrinter.print()

    }

    export() {

        return { seeds: this.seeds, }

    }

}

export { Tile, Wall, Walkable, Character, unit, World }