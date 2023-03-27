import { resolveStringable } from "../2DGameEngine.js";
export function drawText(ctx, text, textoptions) {
    let color = textoptions.color ? resolveStringable(textoptions.color) : null;
    let outlineColor = textoptions.outlineColor ? resolveStringable(textoptions.outlineColor) : null;
    if (!color && !outlineColor)
        return;
    let value = resolveStringable(text);
    let size = textoptions.size ?? 1;
    let font = textoptions.font ?? 'sans-serif';
    let align = textoptions.align ?? 'center';
    let baseline = textoptions.baseline ?? 'middle';
    let maxWidth = textoptions.maxWidth ?? 1000000;
    ctx.save();
    ctx.transform(size, 0, 0, -size, textoptions.posX ?? 0, textoptions.posY ?? 0);
    ctx.font = `1px ${font}`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    if (outlineColor) {
        ctx.lineWidth = textoptions.lineWidth ?? 1;
        ctx.strokeStyle = outlineColor;
        ctx.strokeText(value, 0, 0, maxWidth / size);
    }
    if (color) {
        ctx.fillStyle = color;
        ctx.fillText(value, 0, 0, maxWidth / size);
    }
    ctx.restore();
}
