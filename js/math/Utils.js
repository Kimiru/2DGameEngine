export function lerp(a, b, t) { return (1 - t) * a + t * b; }
export function coserp(a, b, t) {
    let t2 = (1 - Math.cos(t * Math.PI)) / 2;
    return (1 - t2) * a + t2 * b;
}
export function map(nbr, sourceMin, sourceMax, targetMin, targetMax) {
    let t = (nbr - sourceMin) / (sourceMax - sourceMin);
    let res = t * (targetMax - targetMin) + targetMin;
    return res;
}
