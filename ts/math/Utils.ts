import { Vector } from "./Vector.js"

export function lerp(a: number, b: number, t: number): number { return (1 - t) * a + t * b }

export function invLerp(a: number, b: number, v: number): number { return (v - a) / (b - a) }

export function lerpArray(a: number[], b: number[], t: number): number[] {

    let min = Math.min(a.length, b.length)

    let result: number[] = []

    for (let index = 0; index < min; index++)
        result.push(lerp(a[index], b[index], t))

    return result

}

export function invLerpArray(a: number[], b: number[], t: number): number[] {

    let min = Math.min(a.length, b.length)

    let result: number[] = []

    for (let index = 0; index < min; index++)
        result.push(invLerp(a[index], b[index], t))

    return result

}

export function coserp(a: number, b: number, t: number): number {

    let t2 = (1 - Math.cos(t * Math.PI)) / 2

    return (1 - t2) * a + t2 * b

}

export function map(nbr: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number) {

    let t = invLerp(sourceMin, sourceMax, nbr)

    return lerp(targetMin, targetMax, t)

}

export function minmax(min: number, value: number, max: number) {

    return Math.max(min, Math.min(value, max))

}

export function cubicBezier(p0: number[], p1: number[], p2: number[], p3: number[], t: number): number[] {

    t = minmax(0, t, 1)

    const tt = t * t
    const mt = (1 - t)
    const mtt = mt * mt
    const w0 = tt * t
    const w1 = 3 * mtt * t
    const w2 = 3 * mt * tt
    const w3 = mtt * mt

    let result: number[] = []

    for (let index = 0; index < p0.length; index++)
        result.push(w0 * p0[index] + w1 * p1[index] + w2 * p2[index] + w3 * p3[index])

    return result

}

export function quadBezier(p0: number[], p1: number[], p2: number[], t: number) {

    let mt = (1 - t)

    let w0 = mt * mt
    let w1 = 2 * mt * t
    let w2 = t * t

    let result: number[] = []

    for (let index = 0; index < p0.length; index++)
        result.push(w0 * p0[index] + w1 * p1[index] + w2 * p2[index])

    return result

}