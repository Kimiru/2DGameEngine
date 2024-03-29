import { resolveStringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
import { Timer } from "../math/Timer.js";
import { drawText } from "./Utils.js";
export class Button extends GameObject {
    text = '';
    #active = new Timer(0);
    rect = new Rectangle(0, 0, 1, 1);
    get active() { return this.#active.lessThan(150); }
    options = {};
    color = 'white';
    activeColor = 'gray';
    onSound;
    constructor(text, options = {}, onSound = null, margin = 0) {
        super();
        this.text = text;
        this.options = options;
        this.onSound = onSound;
        this.position.set(options.posX ?? 0, options.posY ?? 0);
        options.posX = 0;
        options.posY = 0;
        this.rect.transform.scale.set((options.maxWidth ?? 100) * 1.1 + margin, (options.size ?? 16) * 1.1 + margin);
        if (options.align === 'right')
            this.rect.x = -this.rect.w / 2;
        if (options.align === 'left')
            this.rect.x = this.rect.w / 2;
        this.add(this.rect);
    }
    get currentColor() { return resolveStringable(this.active ? this.activeColor : this.color); }
    update(dt) {
        let mouse = this.input.mouse;
        if (mouse.leftClick) {
            if (this.rect.containsWorldVector(mouse.position) && !this.active) {
                this.#active.reset();
                this.onClick();
                if (this.onSound)
                    this.engine.soundBank.get(this.onSound)?.play();
            }
        }
        if (this.active)
            this.rect.displayColor = 'blue';
        else
            this.rect.displayColor = 'red';
    }
    onClick() { }
    postDraw(ctx) {
        drawText(ctx, this.text, this.options);
    }
}
