export function lerp(a, b, t) { return (1 - t) * a + t * b; }
export function invLerp(a, b, v) { return (v - a) / (b - a); }
export function lerpArray(a, b, t) {
    let min = Math.min(a.length, b.length);
    let result = [];
    for (let index = 0; index < min; index++)
        result.push(lerp(a[index], b[index], t));
    return result;
}
export function invLerpArray(a, b, t) {
    let min = Math.min(a.length, b.length);
    let result = [];
    for (let index = 0; index < min; index++)
        result.push(invLerp(a[index], b[index], t));
    return result;
}
export function coserp(a, b, t) {
    let t2 = (1 - Math.cos(t * Math.PI)) / 2;
    return (1 - t2) * a + t2 * b;
}
export function map(nbr, sourceMin, sourceMax, targetMin, targetMax) {
    let t = invLerp(sourceMin, sourceMax, nbr);
    return lerp(targetMin, targetMax, t);
}
export function minmax(min, value, max) {
    return Math.max(min, Math.min(value, max));
}
export function cubicBezier(p0, p1, p2, p3, t) {
    t = minmax(0, t, 1);
    const tt = t * t;
    const mt = (1 - t);
    const mtt = mt * mt;
    const w0 = tt * t;
    const w1 = 3 * mtt * t;
    const w2 = 3 * mt * tt;
    const w3 = mtt * mt;
    let result = [];
    for (let index = 0; index < p0.length; index++)
        result.push(w0 * p0[index] + w1 * p1[index] + w2 * p2[index] + w3 * p3[index]);
    return result;
}
