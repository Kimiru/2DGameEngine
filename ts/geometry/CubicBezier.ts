import { GameObject, Vector, cubicBezier, lerp, minmax } from "../2DGameEngine.js"

export class CubicBezier extends GameObject {

    #point_0: Vector
    #control_0: Vector
    #control_1: Vector
    #point_1: Vector

    get point_0(): Vector { return this.#point_0 }
    get control_0(): Vector { return this.#control_0 }
    get control_1(): Vector { return this.#control_1 }
    get point_1(): Vector { return this.#point_1 }

    #lengthCache: number = null
    #lengthToT: Map<number, number> = new Map()
    #tToLength: Map<number, number> = new Map()

    lineWidth: number = 0.01
    strokeStyle: string | CanvasGradient | CanvasPattern = 'black'

    /**
     * 
     * @param point_0 
     * @param control_0 
     * @param control_1 
     * @param point_1 
     */
    constructor(point_0: Vector, control_0: Vector, control_1: Vector, point_1: Vector) {

        super()

        let handler = this.#proxyHandler()

        this.#point_0 = new Proxy(point_0.clone(), handler)
        this.#control_0 = new Proxy(control_0.clone(), handler)
        this.#control_1 = new Proxy(control_1.clone(), handler)
        this.#point_1 = new Proxy(point_1.clone(), handler)

    }

    #proxyHandler(): ProxyHandler<Vector> {

        let me = this

        return {
            set(target: Vector, p: string | symbol, newValue: any, receiver: any) {

                me.invalidateCache()

                return Reflect.set(target, p, newValue, receiver)

            }
        }

    }

    get(t: number): Vector {

        return new Vector(...cubicBezier([this.#point_0.x, this.#point_0.y], [this.#control_0.x, this.#control_0.y], [this.#control_1.x, this.#control_1.y], [this.#point_1.x, this.#point_1.y], t))

    }

    getLengthAtT(t: number) {

        if (this.#lengthToT.size === 0) this.#computeLengthToT()

        t = minmax(0, t, 1)

        if (t === 0) return 0
        if (t == 1) return this.#tToLength.get(1)

        let subt = Math.floor(t * 100) / 100

        return lerp(this.#tToLength.get(subt), this.#tToLength.get(subt + 0.01), t - subt)

    }

    getTAtLength(length: number) {

        if (this.#lengthToT.size === 0) this.#computeLengthToT()

        length = minmax(0, length, this.#tToLength.get(1))

        if (length === this.#tToLength.get(1)) return 1
        if (length === 0) return 0

        let keys = [...this.#lengthToT.keys()].sort((a, b) => a - b)
        let keyindex = keys.indexOf(keys.find(key => length >= key))

        let d0 = keys[keyindex]
        let d1 = keys[keyindex + 1]
        let d = d1 - d0
        let t = (length - d0) / d

        let t0 = this.#lengthToT.get(d0)
        let t1 = this.#lengthToT.get(d1)

        return lerp(t0, t1, t)

    }

    #computeLengthToT() {

        this.#lengthToT.clear()
        this.#tToLength.clear()

        let length: number = 0
        let prev = this.get(0)

        this.#lengthToT.set(0, 0)
        this.#tToLength.set(0, 0)
        for (let t = 0.01; t <= 1; t += 0.01) {
            let current = this.get(t)
            length += Vector.distanceBetween(prev, current)
            this.#lengthToT.set(length, t)
            this.#tToLength.set(t, length)
            prev = current
        }


    }

    length(): number {

        if (this.#lengthCache !== null) return this.#lengthCache

        let length: number = 0

        let prev = this.get(0)
        for (let t = 0.01; t <= 1; t += 0.01) {
            let current = this.get(t)
            length += Vector.distanceBetween(prev, current)
            prev = current
        }

        this.#lengthCache = length

        this.#computeLengthToT()

        return length

    }

    invalidateCache() {

        this.#lengthCache = null
        this.#lengthToT.clear()
        this.#tToLength.clear()

    }

    draw(ctx: CanvasRenderingContext2D): void {

        ctx.save()

        ctx.lineWidth = this.lineWidth
        ctx.strokeStyle = this.strokeStyle

        ctx.beginPath()
        ctx.moveTo(this.#point_0.x, this.#point_0.y)
        ctx.bezierCurveTo(this.#control_0.x, this.#control_0.y, this.#control_1.x, this.#control_1.y, this.#point_1.x, this.#point_1.y)
        ctx.stroke()

        ctx.restore()

    }

}