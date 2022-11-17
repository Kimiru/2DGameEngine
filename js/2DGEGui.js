import { GameObject, Timer } from "./2DGameEngine.js";
import { Rectangle } from "./2DGEGeometry.js";
/**
 * The FPSCounter class is, as its name says, used to display the number of FPS of the game on the top left corner of the screen in a given font size
 */
export class FPSCounter extends GameObject {
    timer = new Timer();
    frameCount = 0;
    fps = 0;
    fontSize = 12;
    /**
     * Create a new FPSCounter with a given font size
     *
     * @param fontsize
     */
    constructor(fontsize = 10) {
        super();
        this.fontSize = fontsize;
    }
    /**
     * Update the timer
     * Should not be called by the user
     *
     * @param {number} dt
     * @returns {boolean}
     */
    update(dt) {
        this.frameCount++;
        if (this.timer.greaterThan(1000)) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.timer.reset();
        }
        return true;
    }
    /**
     * Draw the timer on the top left corner
     * Should not be called by the user
     *
     * @param {CanvasRenderingContext2D} ctx
     * @return {boolean}
     */
    draw(ctx) {
        ctx.save();
        let engine = this.engine;
        ctx.translate(-engine.usableWidth / 2, engine.usableHeight / 2);
        ctx.scale(1, -1);
        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.fillStyle = 'red';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.fps.toString(), this.fontSize / 2, this.fontSize / 2);
        ctx.restore();
        return true;
    }
}
export class MouseCursor extends GameObject {
    constructor() {
        super();
    }
    update(dt) {
        let mouse = this.scene.engine.input.mouse;
        this.transform.translation.copy(mouse.position);
    }
    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -5);
        ctx.lineTo(4, -4);
        ctx.lineTo(0, 0);
        ctx.fill();
    }
}
export class TextBox extends GameObject {
    text = '';
    active = false;
    rect = new Rectangle(0, 0, 1, 1);
    fontSize;
    font;
    width;
    color = 'white';
    onSound;
    offSound;
    placeholder = '';
    constructor(fontSize, width, font = 'sans-serif', color = 'black', onSound = null, offSound = null) {
        super();
        this.fontSize = fontSize;
        this.font = font;
        this.width = width;
        this.color = color;
        this.onSound = onSound;
        this.offSound = offSound;
        this.rect.transform.scale.set(width + 4, fontSize + 4);
        this.add(this.rect);
        window.addEventListener('keydown', async (event) => {
            if (this.active) {
                if (event.code === 'KeyV' && event.ctrlKey)
                    this.text += await navigator.clipboard.readText();
                else if (event.key.length === 1)
                    this.text += event.key;
                else if (event.key === 'Backspace')
                    this.text = this.text.slice(0, -1);
                else if (event.key === 'Enter') {
                    this.rect.displayColor = 'red';
                    this.active = false;
                    if (this.offSound)
                        this.engine.soundBank.get(this.offSound)?.play();
                }
            }
        });
        this.drawAfterChildren();
    }
    update(dt) {
        let mouse = this.input.mouse;
        if (mouse.leftClick) {
            if (this.rect.containsWorldVector(mouse.position)) {
                if (!this.active) {
                    this.rect.displayColor = 'blue';
                    this.active = true;
                    if (this.onSound)
                        this.engine.soundBank.get(this.onSound)?.play();
                }
            }
            else {
                if (this.active) {
                    this.rect.displayColor = 'red';
                    this.active = false;
                    if (this.offSound)
                        this.engine.soundBank.get(this.offSound)?.play();
                }
            }
        }
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(-this.width / 2, 0);
        ctx.scale(1, -1);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.fillStyle = this.color;
        let txt = this.text + (this.active ? '_' : '');
        if (txt.length === 0)
            txt = this.placeholder;
        ctx.fillText(txt, 0, 0, this.width);
        ctx.restore();
    }
}
export class Button extends GameObject {
    text = '';
    #active = new Timer(0);
    rect = new Rectangle(0, 0, 1, 1);
    get active() { return this.#active.lessThan(150); }
    fontSize;
    font;
    width;
    color = 'white';
    activeColor = 'gray';
    onSound;
    constructor(fontSize, width, font = 'sans-serif', color = 'black', onSound = null, margin = 4) {
        super();
        this.fontSize = fontSize;
        this.font = font;
        this.width = width;
        this.color = color;
        this.onSound = onSound;
        this.rect.transform.scale.set(width + margin, fontSize + margin);
        this.add(this.rect);
        this.drawAfterChildren();
    }
    get currentColor() { return this.active ? this.activeColor : this.color; }
    update(dt) {
        let mouse = this.input.mouse;
        if (mouse.leftClick) {
            if (this.rect.containsWorldVector(mouse.position) && !this.active) {
                this.#active.reset();
                this.onActive();
                if (this.onSound)
                    this.engine.soundBank.get(this.onSound)?.play();
            }
        }
        if (this.active)
            this.rect.displayColor = 'blue';
        else
            this.rect.displayColor = 'red';
    }
    onActive() { }
    draw(ctx) {
        ctx.save();
        ctx.scale(1, -1);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.fillStyle = this.currentColor;
        ctx.fillText(this.text, 0, 0, this.width);
        ctx.restore();
    }
}
export class Label extends GameObject {
    text = '';
    align = 'left';
    fontSize = 12;
    font = 'sans-serif';
    color = 'white';
    baseline = 'middle';
    maxWidth = 300;
    /**
     *
     * @param {string} text
     * @param {CanvasTextAlign} align
     * @param {number} fontSize
     * @param {string} font
     * @param {string} color
     * @param {CanvasTextBaseline} baseline
     * @param {number} maxWidth
     */
    constructor(text, align, fontSize, font, color, baseline, maxWidth) {
        super();
        this.text = text;
        this.align = align;
        this.fontSize = fontSize;
        this.font = font;
        this.color = color;
        this.baseline = baseline;
        this.maxWidth = maxWidth;
        this.drawAfterChildren();
    }
    draw(ctx) {
        ctx.save();
        ctx.textAlign = this.align;
        ctx.font = `${this.fontSize}px ${this.font}`;
        ctx.textBaseline = this.baseline;
        ctx.fillStyle = this.color;
        ctx.scale(1, -1);
        ctx.fillText(this.text, 0, 0, this.maxWidth);
        ctx.restore();
    }
}
export class CheckBox extends GameObject {
    checked = false;
    rect = new Rectangle(0, 0, 1, 1);
    rectColor;
    checkColor;
    size;
    sound;
    constructor(checked = false, size = 10, rectColor = 'white', checkColor = 'red', sound = null) {
        super();
        this.checked = checked;
        this.rectColor = rectColor;
        this.checkColor = checkColor;
        this.size = size;
        this.sound = sound;
        this.rect.transform.scale.set(size, size);
        this.add(this.rect);
    }
    update(dt) {
        let mouse = this.input.mouse;
        if (this.rect.containsWorldVector(mouse.position) && mouse.leftClick) {
            this.checked = !this.checked;
            this.onChange();
            if (this.sound)
                this.engine.soundBank.get(this.sound)?.play();
        }
    }
    onChange() { }
    draw(ctx) {
        let hs = this.size / 2;
        if (this.checked) {
            ctx.strokeStyle = this.checkColor;
            ctx.beginPath();
            ctx.moveTo(-hs, -hs);
            ctx.lineTo(hs, hs);
            ctx.moveTo(-hs, hs);
            ctx.lineTo(hs, -hs);
            ctx.stroke();
        }
        ctx.strokeStyle = this.rectColor;
        ctx.strokeRect(-hs, -hs, this.size, this.size);
    }
}
