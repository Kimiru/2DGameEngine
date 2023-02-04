import { range } from "../basics/Utils.js"
import { lerp } from "./Utils.js"
import { Vector } from "./Vector.js"

export class PseudoRandom {

    static a: number = 1664525
    static c: number = 1013904223
    static m: number = Math.pow(2, 32)

    seed: number
    a: number = PseudoRandom.a
    c: number = PseudoRandom.c
    m: number = PseudoRandom.m

    constructor(seed: number = Math.random()) {

        this.seed = seed

    }

    get() {

        this.seed = (this.a * this.seed + this.c) % this.m
        return this.seed / this.m

    }

    static get(seed: number = Math.random()) {

        return ((PseudoRandom.a * seed + PseudoRandom.c) % PseudoRandom.m) / PseudoRandom.m

    }

}

export class PerlinNoise {

    rng: PseudoRandom
    seed: number
    grid: Vector[][][]
    horizontalLoop: number
    verticalLoop: number
    depthLoop: number

    constructor(seed: number = Math.random(), horizontalLoop: number = 2048, verticalLoop: number = 2048, depthLoop: number = 2048) {

        this.seed = seed
        this.horizontalLoop = horizontalLoop
        this.verticalLoop = verticalLoop
        this.depthLoop = depthLoop

        this.rng = new PseudoRandom(seed)

        this.grid = []

        for (let x of range(horizontalLoop)) {
            this.grid.push([])
            for (let y of range(verticalLoop)) {
                this.grid[x].push([])
                for (let z of range(depthLoop)) {

                    // let r = this.rng.get() * Math.PI * 2
                    let s = this.seed ^ x ^ (y * 57) ^ (z * 29)

                    let xv = Math.cos(s)
                    let yv = Math.sin(s)
                    let zv = PseudoRandom.get(s) * 2 - 1

                    let vec = new Vector(xv, yv, zv)

                    this.grid[x][y].push(vec)
                }

            }

        }

    }

    fade(t: number) {

        return t * t * t * (t * (t * 6 - 15) + 10)

    }

    getVector(ix: number, iy: number, iz: number): Vector {

        ix = ((ix % this.horizontalLoop) + this.horizontalLoop) % this.horizontalLoop
        iy = ((iy % this.verticalLoop) + this.verticalLoop) % this.verticalLoop
        iz = ((iz % this.depthLoop) + this.depthLoop) % this.depthLoop

        let vec = this.grid[ix][iy][iz]

        return vec

    }

    gradDotProduct(ix: number, iy: number, iz: number, x: number, y: number, z: number): number {

        let distanceVector = new Vector(x - ix, y - iy, z - iz)
        let grad = this.getVector(ix, iy, iz)

        let product = distanceVector.dot(grad)

        return product

    }

    get(x: number, y: number, z: number = 0): number {

        let x0 = Math.floor(x)
        let x1 = x0 + 1
        let y0 = Math.floor(y)
        let y1 = y0 + 1
        let z0 = Math.floor(z)
        let z1 = z0 + 1

        let sx = this.fade(x - x0)
        let sy = this.fade(y - y0)
        let sz = this.fade(z - z0)


        let n0: number, n1: number, lpy0: number, lpy1: number, lpz0: number, lpz1: number, value: number

        n0 = this.gradDotProduct(x0, y0, z0, x, y, z)
        n1 = this.gradDotProduct(x1, y0, z0, x, y, z)
        lpy0 = lerp(n0, n1, sx)
        n0 = this.gradDotProduct(x0, y1, z0, x, y, z)
        n1 = this.gradDotProduct(x1, y1, z0, x, y, z)
        lpy1 = lerp(n0, n1, sx)
        lpz0 = lerp(lpy0, lpy1, sy)

        n0 = this.gradDotProduct(x0, y0, z1, x, y, z)
        n1 = this.gradDotProduct(x1, y0, z1, x, y, z)
        lpy0 = lerp(n0, n1, sx)
        n0 = this.gradDotProduct(x0, y1, z1, x, y, z)
        n1 = this.gradDotProduct(x1, y1, z1, x, y, z)
        lpy1 = lerp(n0, n1, sx)
        lpz1 = lerp(lpy0, lpy1, sy)

        value = lerp(lpz0, lpz1, sz)

        return value

    }

}