import { map } from '../2DGameEngine.js';
import { GameObject } from '../basics/GameObject.js';
const ctx = document.createElement('canvas').getContext('2d');
const rainbow = ctx.createLinearGradient(-1, 0, .5, 0);
rainbow.addColorStop(0, 'hsl(0, 100%, 50%');
rainbow.addColorStop(1 / 6, 'hsl(60, 100%, 50%');
rainbow.addColorStop(1 / 3, 'hsl(120, 100%, 50%');
rainbow.addColorStop(1 / 2, 'hsl(180, 100%, 50%');
rainbow.addColorStop(2 / 3, 'hsl(240, 100%, 50%');
rainbow.addColorStop(5 / 6, 'hsl(300, 100%, 50%');
rainbow.addColorStop(1, 'hsl(360, 100%, 50%');
export class ColorPicker extends GameObject {
    h = 0;
    s = 100;
    l = 50;
    draw(ctx) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = .01;
        ctx.fillStyle = 'white';
        ctx.fillRect(-1, -.5, 2, 1);
        ctx.fillStyle = rainbow;
        ctx.fillRect(-1, 0.3125, 1.5, .125);
        const saturation = ctx.createLinearGradient(-1, 0, .5, 0);
        saturation.addColorStop(0, `hsl(${this.h}, 0%, ${this.l}%)`);
        saturation.addColorStop(1, `hsl(${this.h}, 100%, ${this.l}%)`);
        ctx.fillStyle = saturation;
        ctx.fillRect(-1, 0.0625, 1.5, .125);
        const lightness = ctx.createLinearGradient(-1, 0, .5, 0);
        lightness.addColorStop(0, `hsl(${this.h}, ${this.s}%, 0%)`);
        lightness.addColorStop(.5, `hsl(${this.h}, ${this.s}%, 50%)`);
        lightness.addColorStop(1, `hsl(${this.h}, ${this.s}%, 100%)`);
        ctx.fillStyle = lightness;
        ctx.fillRect(-1, -0.1875, 1.5, .125);
        ctx.fillStyle = `hsl(${this.h}, ${this.s}%, ${this.l}%)`;
        ctx.fillRect(-1, -0.4375, 1.5, .125);
        let h = map(this.h, 0, 360, -1, .5);
        let s = map(this.s, 0, 100, -1, .5);
        let l = map(this.l, 0, 100, -1, .5);
        ctx.beginPath();
        ctx.moveTo(h, .5);
        ctx.lineTo(h, .25);
        ctx.moveTo(s, .25);
        ctx.lineTo(s, 0);
        ctx.moveTo(l, 0);
        ctx.lineTo(l, -.25);
        ctx.stroke();
    }
}
