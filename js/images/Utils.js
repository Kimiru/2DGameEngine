export function SVGStringToImage(svg) {
    let blob = new Blob([svg], { type: 'image/svg+xml' });
    let url = URL.createObjectURL(blob);
    return new Promise((ok, ko) => {
        let image = new Image();
        image.onload = () => { ok(image); };
        image.onerror = (err) => { ko(err); };
        image.src = url;
    });
}
export function loadDataUrl(dataurl) {
    return new Promise((ok) => {
        let image = new Image();
        image.onload = () => ok(image);
        image.onerror = () => ok(image);
        image.src = dataurl;
    });
}
