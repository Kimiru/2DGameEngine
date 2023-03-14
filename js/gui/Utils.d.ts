import { stringable } from "../2DGameEngine.js";
export type textoptions = {
    size?: number;
    font?: stringable;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    color?: stringable;
    outlineColor?: stringable;
    lineWidth?: number;
    maxWidth?: number;
    posX?: number;
    posY?: number;
};
export declare function drawText(ctx: CanvasRenderingContext2D, text: stringable, textoptions: textoptions): void;
