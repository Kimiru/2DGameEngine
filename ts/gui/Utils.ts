import { resolveStringable, stringable } from "../2DGameEngine.js"

export type textoptions = {

    size?: number
    font?: stringable

    align?: CanvasTextAlign
    baseline?: CanvasTextBaseline

    color?: stringable
    outlineColor?: stringable

    lineWidth?: number
    maxWidth?: number

    posX?: number
    posY?: number

}

export function drawText(ctx: CanvasRenderingContext2D, text: stringable, textoptions: textoptions) {

    let color = textoptions.color ? resolveStringable(textoptions.color) : null
    let outlineColor = textoptions.outlineColor ? resolveStringable(textoptions.outlineColor) : null

    if (!color && !outlineColor) return

    let value = resolveStringable(text)

    let size = textoptions.size ?? 1
    let font = textoptions.font ?? 'sans-serif'

    let align = textoptions.align ?? 'center'
    let baseline = textoptions.baseline ?? 'middle'

    let maxWidth = textoptions.maxWidth ?? undefined

    ctx.save()
    ctx.transform(size, 0,
        0, -size,
        textoptions.posX ?? 0,
        textoptions.posY ?? 0)

    ctx.font = `1px ${font}`
    ctx.textAlign = align
    ctx.textBaseline = baseline

    if (outlineColor) {
        ctx.lineWidth = textoptions.lineWidth ?? 1
        ctx.strokeStyle = outlineColor
        ctx.strokeText(value, 0, 0, maxWidth / size)
    }

    if (color) {
        ctx.fillStyle = color
        ctx.fillText(value, 0, 0, maxWidth / size)
    }

    ctx.restore()

}