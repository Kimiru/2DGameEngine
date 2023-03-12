import { GameComponent } from "../2DGameEngine.js";
export declare class ValueToggle extends GameComponent {
    #private;
    active: boolean;
    speed: number;
    patternFunction: (t: number) => number;
    constructor(patternFunction: (t: number) => number, speed?: number);
    get value(): number;
    on(): void;
    off(): void;
    set(active: boolean): void;
    toggle(): void;
    update(dt: any): void;
}
