import { GameObject, HSLToRGB, HexColorToRGB, RBGToHexColor, RGBToHSL, Rectangle, TextBox, map, minmax } from '../2DGameEngine.js';
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
    htb = new TextBox(.15, .5 / 1.1, 'sans-serif', 'black');
    stb = new TextBox(.15, .5 / 1.1, 'sans-serif', 'black');
    ltb = new TextBox(.15, .5 / 1.1, 'sans-serif', 'black');
    h = 0;
    s = 100;
    l = 50;
    constructor() {
        super();
        this.htb.text = '0';
        this.htb.align = 'center';
        this.htb.baseline = 'middle';
        this.htb.transform.translation.set(.75, 0.375);
        this.htb.onFinish = (str) => {
            if (!isNaN(parseInt(str)))
                this.h = minmax(0, parseInt(str), 360);
            this.htb.text = this.h.toString();
            this.onChange(this.h, this.s, this.l);
        };
        this.add(this.htb);
        this.stb.text = '100';
        this.stb.align = 'center';
        this.stb.baseline = 'middle';
        this.stb.transform.translation.set(.75, 0.125);
        this.stb.onFinish = (str) => {
            if (!isNaN(parseInt(str)))
                this.s = minmax(0, parseInt(str), 100);
            this.stb.text = this.s.toString();
            this.onChange(this.h, this.s, this.l);
        };
        this.add(this.stb);
        this.ltb.text = '50';
        this.ltb.align = 'center';
        this.ltb.baseline = 'middle';
        this.ltb.transform.translation.set(.75, -0.125);
        this.ltb.onFinish = (str) => {
            if (!isNaN(parseInt(str)))
                this.l = minmax(0, parseInt(str), 100);
            this.ltb.text = this.l.toString();
            this.onChange(this.h, this.s, this.l);
        };
        this.add(this.ltb);
    }
    getHSLColor() { return `hsl(${this.h},${this.s}%,${this.l}%)`; }
    getHSL() { return [this.h, this.s, this.l]; }
    importHSL(h, s, l) {
        this.h = h;
        this.s = s;
        this.l = l;
        this.htb.text = h.toString();
        this.stb.text = s.toString();
        this.ltb.text = l.toString();
    }
    getRGBColor() { return `rgb(${this.getRGB().join(',')})`; }
    getRGB() { return HSLToRGB(this.h, this.s, this.l); }
    importRGB(r, g, b) { this.importHSL(...RGBToHSL(r, g, b)); }
    getHexColor() {
        return RBGToHexColor(...this.getRGB());
    }
    importHexColor(hexColor) {
        this.importRGB(...HexColorToRGB(hexColor));
    }
    onChange(h, s, l) { }
    update(dt) {
        let mouse = this.input.mouse;
        if (mouse.leftClick) {
            let hueRect = new Rectangle();
            hueRect.parent = this;
            hueRect.w = 1.5;
            hueRect.h = .125;
            hueRect.left = -1;
            hueRect.bottom = 0.3125;
            if (hueRect.containsWorldVector(mouse.position)) {
                console.log('hue');
                return;
            }
        }
    }
    draw(ctx) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = .01;
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
        ctx.fillStyle = this.getHSLColor();
        ctx.fillRect(-1, -0.4375, 1.5, .125);
        let h = map(Number(this.h), 0, 360, -1, .5);
        let s = map(Number(this.s), 0, 100, -1, .5);
        let l = map(Number(this.l), 0, 100, -1, .5);
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
