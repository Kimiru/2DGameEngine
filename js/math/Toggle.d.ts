import { GameComponent } from "../2DGameEngine.js";
export declare class Toggle extends GameComponent {
    #private;
    active: boolean;
    speed: number;
    patternFunction: (t: number) => number;
    constructor(patternFunction: (t: number) => number, speed?: number);
    get value(): number;
    on(): void;
    off(): void;
    toggle(): void;
    update(dt: any): void;
}
