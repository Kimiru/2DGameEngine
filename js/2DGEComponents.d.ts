import { GameComponent } from "./2DGameEngine.js";
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
type UpdateCallback<T> = (object: T, dt: number) => number[] | null;
type DrawCallback<T> = (object: T, ctx: CanvasRenderingContext2D) => void;
export declare class StateMachine<T> extends GameComponent {
    #private;
    componentTag: string;
    unique: boolean;
    boundObject: T;
    state: number[];
    updates: Map<string, UpdateCallback<T>[]>;
    draws: Map<string, DrawCallback<T>[]>;
    constructor(boundObject: T, startState?: number[]);
    setState(state: number[]): void;
    isState(state: number[]): boolean;
    /**
     * Add a callback to a given state value.
     * Multiple callback can be added to the same state, they will then be exeecuted in order.
     * Post state returned state will be ignored
     * Post state execution will not be interupted
     *
     * @param state
     * @param callback
     * @param postState
     */
    addStateCallback(state: number[], update?: UpdateCallback<T>, draw?: DrawCallback<T>, postState?: boolean): void;
    /**
     * Execute the current state callback
     * If a callback in the chain, returns a non null value, the other callback in the chain will not be executed and the current state will change
     * Post state will always be executed, on the reached level, i.e. if root levels change state before, leaf levels, leaf level will not be executed (including they post callback), but the root level post callback will be executed
     *
     * @param dt
     */
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export {};
