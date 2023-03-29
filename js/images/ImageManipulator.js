import { Drawable, Rectangle, Vector, badclone, loadDataUrl } from "../2DGameEngine.js";
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
export const CANVAS_RESOLUTION = 2048;
export class LargeImageManipulator extends GameObject {
    canvases;
    fullSize = new Vector();
    gridSize = new Vector();
    constructor(width, height) {
        super();
        this.updateSize(width, height);
    }
    updateSize(width, height) {
        let horizontalCount = Math.ceil(width / CANVAS_RESOLUTION);
        let verticalCount = Math.ceil(height / CANVAS_RESOLUTION);
        this.fullSize.set(width, height);
        if (this.gridSize.equalS(horizontalCount, verticalCount))
            return;
        this.gridSize.set(horizontalCount, verticalCount);
        let oldCanvases = this.canvases;
        this.canvases = [];
        let techicalWidth = (horizontalCount - 1) / 2;
        let techicalHeight = (verticalCount - 1) / 2;
        for (let x = -techicalWidth; x <= techicalWidth; x++)
            for (let y = -techicalHeight; y <= techicalHeight; y++) {
                let canvas = document.createElement('canvas');
                canvas.width = canvas.height = CANVAS_RESOLUTION;
                let ctx = canvas.getContext('2d');
                this.canvases.push({
                    canvas,
                    ctx,
                    position: new Vector(x, y)
                });
            }
        if (oldCanvases)
            this.run((ctx) => {
                for (let { canvas, position } of oldCanvases) {
                    position.subS(.5, .5).multS(CANVAS_RESOLUTION);
                    ctx.drawImage(canvas, position.x, position.y);
                }
            });
    }
    /**
     * Call the callback on each stored canvas, with the area associated.
     * Edge canvas are automatically clipped out.
     * area Rectangle is freely modifyable
     */
    run(callback, invertVertical = false) {
        let vinv = invertVertical ? -1 : 1;
        let hw = -this.fullSize.x / 2;
        let hh = -this.fullSize.y / 2;
        for (let { ctx, position } of this.canvases) {
            let effectivePosition = position.clone().multS(CANVAS_RESOLUTION);
            ctx.save();
            ctx.setTransform(1, 0, 0, -1, -effectivePosition.x + CANVAS_RESOLUTION / 2, effectivePosition.y + CANVAS_RESOLUTION / 2);
            ctx.beginPath();
            ctx.rect(hw, hh, this.fullSize.x, this.fullSize.y);
            ctx.clip();
            callback(ctx, new Rectangle(effectivePosition.x, effectivePosition.y, CANVAS_RESOLUTION, CANVAS_RESOLUTION));
            ctx.restore();
        }
    }
    export() {
        let result = {
            width: this.fullSize.x,
            height: this.fullSize.y,
            data: []
        };
        for (let { canvas, ctx, position } of this.canvases) {
            result.data.push({
                image: canvas.toDataURL(),
                x: position.x * CANVAS_RESOLUTION,
                y: position.y * CANVAS_RESOLUTION
            });
        }
        console.log(result);
        return result;
    }
    import(raw) {
        if (!raw)
            return;
        console.log(badclone(raw));
        let { width, height, data } = raw;
        for (let { x, y, image } of data) {
            console.log(image);
            loadDataUrl(image)
                .then(image => this.run((ctx) => {
                let drawable = new Drawable(image);
                drawable.size.set(CANVAS_RESOLUTION, CANVAS_RESOLUTION);
                drawable.position.set(x, y);
                drawable.executeDraw(ctx);
            }));
        }
    }
    draw(ctx) {
        ctx.save();
        ctx.scale(1 / this.fullSize.x, -1 / this.fullSize.y);
        for (let { canvas, position } of this.canvases) {
            let positionOnCanvas = position.clone().multS(CANVAS_RESOLUTION).subS(CANVAS_RESOLUTION / 2, -CANVAS_RESOLUTION / 2);
            ctx.drawImage(canvas, positionOnCanvas.x, -positionOnCanvas.y);
        }
        ctx.restore();
    }
}
