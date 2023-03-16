import { resolveStringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
import { drawText } from "./Utils.js";
export class TextBox extends GameObject {
    static lock = false;
    enabled = true;
    text = '';
    active = false;
    cursorPosition = 0;
    rect = new Rectangle(0, 0, 1, 1);
    options = {};
    onSound;
    offSound;
    placeholder = '';
    constructor(placeholder = '', options = {}, onSound = null, offSound = null) {
        super();
        this.placeholder = placeholder;
        this.options = options;
        this.onSound = onSound;
        this.offSound = offSound;
        this.position.set(options.posX ?? 0, options.posY ?? 0);
        options.posX = 0;
        options.posY = 0;
        options.size = options.size ?? 1;
        options.maxWidth = options.maxWidth ?? 1;
        this.rect.transform.scale.set(options.maxWidth * 1.1, options.size * 1.1);
        this.add(this.rect);
        window.addEventListener('keydown', async (event) => {
            if (this.active) {
                if (event.code === 'KeyV' && event.ctrlKey) {
                    this.#addStr(await navigator.clipboard.readText());
                }
                else if (event.key.length === 1) {
                    this.#addStr(event.key);
                }
                else if (event.key === 'Backspace') {
                    this.text = this.text.slice(0, Math.max(0, this.cursorPosition - 1)) + this.text.slice(this.cursorPosition);
                    this.cursorPosition = Math.max(this.cursorPosition - 1, 0);
                }
                else if (event.key === 'Delete') {
                    this.text = this.text.slice(0, this.cursorPosition) + this.text.slice(this.cursorPosition + 1);
                }
                else if (event.key === 'Enter')
                    this.toggleOff();
                else if (event.code === 'ArrowLeft')
                    this.cursorPosition = Math.max(this.cursorPosition - 1, 0);
                else if (event.code === 'ArrowRight')
                    this.cursorPosition = Math.min(this.cursorPosition + 1, this.text.length);
            }
        });
        this.drawAfterChildren();
    }
    #addStr(str) {
        this.text = this.text.slice(0, this.cursorPosition) + str + this.text.slice(this.cursorPosition);
        this.cursorPosition += str.length;
    }
    toggleOn() {
        if (this.active || TextBox.lock || !this.enabled)
            return;
        this.rect.displayColor = 'blue';
        this.active = true;
        this.input.lock('TextBox');
        this.cursorPosition = this.text.length;
        TextBox.lock = true;
        if (this.onSound)
            this.engine.soundBank.get(this.onSound)?.play();
    }
    toggleOff() {
        if (!this.active)
            return;
        this.rect.displayColor = 'red';
        this.active = false;
        this.input.unlock('TextBox');
        TextBox.lock = false;
        if (this.offSound)
            this.engine.soundBank.get(this.offSound)?.play();
        this.onChange(this.text);
    }
    toggle() {
        if (!this.active)
            this.toggleOn();
        else
            this.toggleOff();
    }
    onChange(text) { }
    update(dt) {
        let mouse = this.input.mouse;
        if (mouse.leftClick) {
            if (this.rect.containsWorldVector(mouse.position)) {
                if (!this.active)
                    this.toggleOn();
            }
            else if (this.active)
                this.toggleOff();
        }
    }
    draw(ctx) {
        ctx.save();
        if (this.options.align === 'left')
            ctx.translate(-this.options.maxWidth / 2, 0);
        else if (this.options.align === 'right')
            ctx.translate(this.options.maxWidth / 2, 0);
        let txt = this.text.slice(0, this.cursorPosition) + (this.active ? '_' : '') + (this.text.slice(this.cursorPosition));
        if (txt.length === 0)
            txt = resolveStringable(this.placeholder);
        drawText(ctx, txt, this.options);
        ctx.restore();
    }
}
