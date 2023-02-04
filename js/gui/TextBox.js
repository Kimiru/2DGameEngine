import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
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
