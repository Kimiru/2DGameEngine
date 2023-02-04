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
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, HTMLImageElement>;
export declare function loadSVGs(svgs: {
    name: string;
    src: string;
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, {
    raw: string;
    image: HTMLImageElement;
}>;
export declare class Sound {
    sounds: HTMLAudioElement[];
    volume: number;
    currentSound: HTMLAudioElement;
    constructor(sounds: HTMLAudioElement[]);
    play(): void;
    setVolume(volume: number): void;
}
export declare function loadSounds(sounds: {
    name: string;
    srcs: string[];
}[], incrementCallback: (completed: number) => void, finishedCallback: () => void): Map<string, Sound>;
export declare function id(): number;
export declare function range(min: number, max?: number, step?: number): Generator<number, void, unknown>;
export declare function getCircularReplacer(): (key: any, value: any) => any;
export declare function badclone(o: any): any;
