import { Drawable } from "./Drawable.js";
const SpriteSheetOptions = {
    cellWidth: 16,
    cellHeight: 16,
};
export class SpriteSheet extends Drawable {
    options;
    horizontalCount;
    cursor = 0;
    loopOrigin = 0;
    tileInLoop = 1;
    savedLoop = new Map();
    constructor(image, options = SpriteSheetOptions) {
        super(image);
        this.options = { ...SpriteSheetOptions, ...options };
        this.horizontalCount = this.images[0].width / this.options.cellWidth;
        this.size.set(this.options.cellWidth, this.options.cellHeight);
        this.halfSize.copy(this.size).divS(2);
    }
    XYToIndex(x, y) {
        return x + y * this.horizontalCount;
    }
    indexToXY(index) {
        let x = index % this.horizontalCount;
        let y = Math.floor(index / this.horizontalCount);
        return [x, y];
    }
    saveLoop(name, loopOrigin, tileInLoop) { this.savedLoop.set(name, [loopOrigin, tileInLoop]); }
    useLoop(name, index = 0) { this.setLoop(...this.savedLoop.get(name), index); }
    isLoop(name) { return this.loopOrigin == this.savedLoop.get(name)[0]; }
    setLoop(loopOrigin, tileInLoop, startIndex = 0) {
        this.loopOrigin = loopOrigin;
        this.tileInLoop = tileInLoop;
        this.cursor = this.loopOrigin + startIndex % tileInLoop;
    }
    getLoopIndex() { return this.cursor - this.loopOrigin; }
    next() { this.cursor = this.loopOrigin + (this.getLoopIndex() + 1) % this.tileInLoop; }
    draw(ctx) {
        ctx.save();
        let x = this.cursor % this.horizontalCount;
        let y = Math.floor(this.cursor / this.horizontalCount);
        x *= this.size.x;
        y *= this.size.y;
        ctx.scale(1 / this.size.x, -1 / this.size.y);
        ctx.drawImage(this.images[0], x, y, this.size.x, this.size.y, -this.halfSize.x, -this.halfSize.y, this.size.x, this.size.y);
        ctx.restore();
    }
}