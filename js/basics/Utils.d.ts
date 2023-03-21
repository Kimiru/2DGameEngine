import { GameObject } from "./GameObject.js";
export type imageBank = Map<string, HTMLImageElement>;
/**
 * loads multiple images and use callbacks for progression checks and at the end
 *
 * @param {{ name: string, src: string }[]} images
 * @param {(completed:number) => void} incrementCallback
 * @param {() => void}finishedCallback
 * @returns
 */
export declare function loadImages(images: {
    name: string;
    src: string;
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): imageBank;
export type svgBank = Map<string, {
    raw: string;
    image: HTMLImageElement;
}>;
export declare function loadSVGs(svgs: {
    name: string;
    src: string;
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): svgBank;
export declare class Sound {
    volume: number;
    soundsFifo: HTMLAudioElement[][];
    currentSound: number;
    constructor(soundsFifo: HTMLAudioElement[][]);
    play(): void;
    pause(): void;
    setVolume(volume: number): void;
}
export type soundBank = Map<string, Sound>;
export declare function loadSounds(sounds: {
    name: string;
    srcs: string[];
    backup?: number;
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): soundBank;
export declare function id(): number;
export declare function range(min: number, max?: number, step?: number): Generator<number, void, unknown>;
export declare function getCircularReplacer(): (key: any, value: any) => any;
export declare function badclone<T>(o: T): T;
export type stringable = string | (() => string);
export declare function resolveStringable(value: stringable): string;
export declare function dummy(x?: number, y?: number): GameObject;
