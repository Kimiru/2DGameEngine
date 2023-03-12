import { GameObject, HexColorToRGB, HSLToRGB, map, minmax, RBGToHexColor, Rectangle, RGBToHSL, Segment, TextBox, TransformMatrix, Vector } from '../2DGameEngine.js';
const ctx = document.createElement('canvas').getContext('2d');
const rainbow = ctx.createLinearGradient(-1, 0, .5, 0);
rainbow.addColorStop(0, 'hsl(0, 100%, 50%');
rainbow.addColorStop(1 / 6, 'hsl(60, 100%, 50%');
rainbow.addColorStop(1 / 3, 'hsl(120, 100%, 50%');
rainbow.addColorStop(1 / 2, 'hsl(180, 100%, 50%');
rainbow.addColorStop(2 / 3, 'hsl(240, 100%, 50%');
rainbow.addColorStop(5 / 6, 'hsl(300, 100%, 50%');
rainbow.addColorStop(1, 'hsl(360, 100%, 50%');
let textboxOptions = {
    size: .15,
    font: 'sans-serif',
    color: 'black',
    maxWidth: .4,
    align: 'center',
    baseline: 'middle'
};
export class ColorPicker extends GameObject {
    htb = new TextBox('0', textboxOptions);
    stb = new TextBox('100', textboxOptions);
    ltb = new TextBox('50', textboxOptions);
    h = 0;
    s = 100;
    l = 50;
    constructor() {
        super();
        this.htb.transform.translation.set(.75, 0.375);
        this.htb.onFinish = (str) => {
            if (!isNaN(parseInt(str)))
                this.h = minmax(0, parseInt(str), 360);
            this.htb.text = this.h.toString();
            this.onChange(this.h, this.s, this.l);
        };
        this.add(this.htb);
        this.stb.transform.translation.set(.75, 0.125);
        this.stb.onFinish = (str) => {
            if (!isNaN(parseInt(str)))
                this.s = minmax(0, parseInt(str), 100);
            this.stb.text = this.s.toString();
            this.onChange(this.h, this.s, this.l);
        };
        this.add(this.stb);
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
        let rect = new Rectangle(0, 0, 2.5, 1);
        rect.parent = this;
        if ((mouse.left || mouse.leftClick) && rect.containsWorldVector(mouse.position)) {
            let wtm = this.getWorldTransformMatrix();
            rect.w = 1.5;
            rect.h = .125;
            rect.left = -1;
            rect.bottom = 0.3125;
            let left = TransformMatrix.multVec(wtm, new Vector(rect.left, rect.y));
            let right = TransformMatrix.multVec(wtm, new Vector(rect.right, rect.y));
            let [t, p] = new Segment(left, right).project(mouse.position);
            if (rect.containsWorldVector(mouse.position) && !mouse.leftClick) {
                this.h = Math.round(360 * t);
                this.htb.text = this.h.toString();
                return;
            }
            rect.bottom = 0.0625;
            if (rect.containsWorldVector(mouse.position) && !mouse.leftClick) {
                this.s = Math.round(100 * t);
                this.stb.text = this.s.toString();
                return;
            }
            rect.bottom = -0.1875;
            if (rect.containsWorldVector(mouse.position) && !mouse.leftClick) {
                this.l = Math.round(100 * t);
                this.ltb.text = this.l.toString();
                return;
            }
            if (mouse.leftClick)
                this.onChange(this.h, this.s, this.l);
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
