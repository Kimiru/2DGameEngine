import { ImageManipulator } from "./ImageManipulator.js";
export declare class TextureMapper {
    #private;
    static map(modelIM: ImageManipulator, colorChartIM: ImageManipulator, textureIM: ImageManipulator): ImageManipulator;
    static downloadStandardColorChart(width: number, height: number): void;
}
