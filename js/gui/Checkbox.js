import { resolveStringable } from "../2DGameEngine.js";
import { GameObject } from "../basics/GameObject.js";
import { Rectangle } from "../geometry/Rectangle.js";
export class CheckBox extends GameObject {
    checked = false;
    rect = new Rectangle(0, 0, 1, 1);
    options = {};
    sound;
    constructor(checked = false, options = {}, sound = null) {
        super();
        this.checked = checked;
        this.options = options;
        this.sound = sound;
        this.position.set(options.posX ?? 0, options.posY ?? 0);
        options.posX = 0;
        options.posY = 0;
        let size = this.options.size ?? 1;
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
        let size = this.options.size ?? 1;
        let hs = size / 2;
        ctx.lineWidth = this.options.lineWidth ?? .1;
        if (this.checked) {
            ctx.strokeStyle = resolveStringable(this.options.outlineColor ?? 'black');
            ctx.beginPath();
            ctx.moveTo(-hs, -hs);
            ctx.lineTo(hs, hs);
            ctx.moveTo(-hs, hs);
            ctx.lineTo(hs, -hs);
            ctx.stroke();
        }
        ctx.strokeStyle = resolveStringable(this.options.color ?? 'black');
        ctx.strokeRect(-hs, -hs, size, size);
    }
}
