import { Drawable } from "./Drawable.js";
const SpriteSheetOptions = {
    images: [],
    cellWidth: 16,
    cellHeight: 16,
};
export class SpriteSheet extends Drawable {
    options;
    horizontalCount;
    cursor = 0;
    loopOrigin = 0;
    tileInLoop = 1;
    fps = 0;
    lastFps = Date.now();
    savedLoop = new Map();
    constructor(options = SpriteSheetOptions) {
        super(...options.images);
        this.options = { ...options };
        this.horizontalCount = this.images[0].width / this.options.cellWidth;
        this.imageSize.set(this.options.cellWidth, this.options.cellHeight);
        this.halfSize.copy(this.imageSize).divS(2);
    }
    XYToIndex(x, y) {
        return x + y * this.horizontalCount;
    }
    indexToXY(index) {
        let x = index % this.horizontalCount;
        let y = Math.floor(index / this.horizontalCount);
        return [x, y];
    }
    saveLoop(name, loopOrigin, tileInLoop, fps) { this.savedLoop.set(name, [loopOrigin, tileInLoop, fps]); }
    useLoop(name, index = 0) { this.setLoop(...this.savedLoop.get(name) ?? [0, 0, 0], index); }
    isLoop(name) {
        let loop = this.savedLoop.get(name);
        if (!loop)
            return false;
        return this.loopOrigin == loop[0];
    }
    setLoop(loopOrigin, tileInLoop, fps, startIndex = 0) {
        this.loopOrigin = loopOrigin;
        this.tileInLoop = tileInLoop;
        this.cursor = this.loopOrigin + startIndex % tileInLoop;
        this.fps = fps;
        this.lastFps = Date.now();
    }
    getLoopIndex() { return this.cursor - this.loopOrigin; }
    next() { this.cursor = this.loopOrigin + (this.getLoopIndex() + 1) % this.tileInLoop; }
    update(dt) {
        if (this.fps === 0)
            return;
        let now = Date.now();
        if (now - this.lastFps > 1000 / this.fps) {
            this.next();
            this.lastFps = now;
        }
    }
    draw(ctx) {
        ctx.save();
        let x = this.cursor % this.horizontalCount;
        let y = Math.floor(this.cursor / this.horizontalCount);
        x *= this.imageSize.x;
        y *= this.imageSize.y;
        ctx.imageSmoothingEnabled = this.imageSmoothing;
        ctx.scale(1 / this.imageSize.x, -1 / this.imageSize.y);
        for (let image of this.images)
            ctx.drawImage(image, x, y, this.imageSize.x, this.imageSize.y, -this.halfSize.x, -this.halfSize.y, this.imageSize.x, this.imageSize.y);
        ctx.restore();
    }
}
