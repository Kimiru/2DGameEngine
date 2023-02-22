export function lerp(a: number, b: number, t: number): number { return (1 - t) * a + t * b }

export function invLerp(a: number, b: number, v: number): number { return (v - a) / (b - a) }

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