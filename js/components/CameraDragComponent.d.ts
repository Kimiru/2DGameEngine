import { GameComponent } from "./GameComponent.js";
export declare class CameraDragComponent extends GameComponent {
    #private;
    componentTag: string;
    unique: boolean;
    static leftButton: number;
    static rightButton: number;
    static middleButton: number;
    button: number;
    scrollZoomEnabled: boolean;
    constructor(button?: number, scrollZoomEnabled?: boolean);
    onAdd(): void;
    update(dt: number): void;
}
