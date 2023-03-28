import { GameObject } from "../basics/GameObject.js";
export class ImageManipulator extends GameObject {
    canvas;
    ctx;
    constructor(width = 1, height = 1) {
        super();
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }
    get width() { return this.canvas.width; }
    get height() { return this.canvas.height; }
    setCtxToCenter() {
        this.ctx.setTransform(this.width, 0, 0, -this.height, this.width / 2, this.height / 2);
    }
    setSize(width, height) {
        let tmpcanvas = document.createElement('canvas');
        tmpcanvas.width = this.canvas.width;
        tmpcanvas.height = this.canvas.height;
        let tmpctx = tmpcanvas.getContext('2d');
        tmpctx.imageSmoothingEnabled = false;
        tmpctx.drawImage(this.canvas, 0, 0);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(tmpcanvas, 0, 0);
    }
    setPixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, 1, 1);
    }
    setPixelRGBA(x, y, r, g, b, a) {
        let imageData = new ImageData(1, 1);
        imageData.data.set([r, g, b, a]);
        this.ctx.putImageData(imageData, x, y);
    }
    getPixel(x, y) {
        let data = this.ctx.getImageData(x, y, 1, 1);
        return [data.data[0], data.data[1], data.data[2], data.data[3]];
    }
    print() { return this.canvas.toDataURL('image/png'); }
    download(name, addSize = false) {
        let a = document.createElement('a');
        a.href = this.print();
        a.download = `${name}${addSize ? `_${this.width}x${this.height}` : ''}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    getImage() {
        return new Promise((ok, ko) => {
            let image = document.createElement('img');
            image.onload = () => ok(image);
            image.onerror = () => ko(null);
            image.src = this.print();
        });
    }
    toString() { return this.print(); }
    clone() {
        let im = new ImageManipulator(this.width, this.height);
        im.ctx.drawImage(this.canvas, 0, 0);
        return im;
    }
    static fromImage(image) {
        let im = new ImageManipulator(image.width, image.height);
        im.ctx.drawImage(image, 0, 0);
        return im;
    }
    draw(ctx) {
        ctx.save();
        ctx.scale(1 / this.width, -1 / this.height);
        ctx.drawImage(this.canvas, -this.width / 2, -this.height / 2);
        ctx.restore();
    }
}
