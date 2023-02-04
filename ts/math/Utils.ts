export function lerp(a: number, b: number, t: number): number { return (1 - t) * a + t * b }

export function coserp(a: number, b: number, t: number): number {

    let t2 = (1 - Math.cos(t * Math.PI)) / 2

    return (1 - t2) * a + t2 * b

}

export function map(nbr: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number) {

    let t = (nbr - sourceMin) / (sourceMax - sourceMin)
    let res = t * (targetMax - targetMin) + targetMin

    return res
}