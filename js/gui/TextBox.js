import { resolveStringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
import { drawText } from "./Utils.js";
export class TextBox extends GameObject {
    static lock = false;
    enabled = true;
    text = '';
    active = false;
    rect = new Rectangle(0, 0, 1, 1);
    options = {};
    onSound;
    offSound;
    placeholder = '';
    constructor(defaultText = '', options = {}, onSound = null, offSound = null) {
        super();
        this.options = options;
        this.onSound = onSound;
        this.offSound = offSound;
        this.rect.transform.scale.set(options.maxWidth * 1.1, options.size * 1.1);
        this.add(this.rect);
        window.addEventListener('keydown', async (event) => {
            if (this.active) {
                if (event.code === 'KeyV' && event.ctrlKey)
                    this.text += await navigator.clipboard.readText();
                else if (event.key.length === 1)
                    this.text += event.key;
                else if (event.key === 'Backspace')
                    this.text = this.text.slice(0, -1);
                else if (event.key === 'Enter')
                    this.toggleOff();
            }
        });
        this.drawAfterChildren();
    }
    toggleOn() {
        if (this.active || TextBox.lock || !this.enabled)
            return;
        this.rect.displayColor = 'blue';
        this.active = true;
        this.input.lock('TextBox');
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
        this.onFinish(this.text);
    }
    toggle() {
        if (!this.active)
            this.toggleOn();
        else
            this.toggleOff();
    }
    onFinish(text) { }
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
        let txt = resolveStringable(this.text) + (this.active ? '_' : '');
        if (txt.length === 0)
            txt = resolveStringable(this.placeholder);
        drawText(ctx, txt, this.options);
        ctx.restore();
    }
}
