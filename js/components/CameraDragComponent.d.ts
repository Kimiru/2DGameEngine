import { GameComponent } from "../basics/GameObject.js";
export declare class CameraDragComponent extends GameComponent {
    #private;
    unique: boolean;
    static leftButton: number;
    static rightButton: number;
    static middleButton: number;
    button: number;
    scrollZoomEnabled: boolean;
    enabled: boolean;
    constructor(button?: number, scrollZoomEnabled?: boolean);
    onAdd(): void;
    update(dt: number): void;
}
