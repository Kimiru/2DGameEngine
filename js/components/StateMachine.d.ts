export type EnterCallback<T> = (object: T) => void;
export type LeaveCallback<T> = (object: T) => void;
export type UpdateCallback<T> = (object: T, dt: number) => (number[] | null);
export type PhysicsCallback<T> = (object: T, dt: number) => void;
export type DrawCallback<T> = (object: T, ctx: CanvasRenderingContext2D) => void;
export interface StateActions<T> {
    enter?: EnterCallback<T>;
    leave?: EnterCallback<T>;
    update?: UpdateCallback<T>;
    physics?: PhysicsCallback<T>;
    draw?: DrawCallback<T>;
    [x: string | number | symbol]: unknown;
}
export declare class StateMachine<T> {
    #private;
    unique: boolean;
    boundObject: T;
    state: number[];
    statesActions: {
        [s: string]: StateActions<T>[];
    };
    constructor(boundObject: T, startState?: number[]);
    setState(state: number[]): void;
    isState(state: number[]): boolean;
    addStateActions(state: number[], stateActions: StateActions<T>, postState?: boolean): void;
    /**
     * Execute the current state callback
     * If a callback in the chain, returns a non null value, the other callback in the chain will not be executed and the current state will change
     * Post state will always be executed, on the reached level, i.e. if root levels change state before, leaf levels, leaf level will not be executed (including they post callback), but the root level post callback will be executed
     *
     * @param dt
     */
    update(dt: number): void;
    physics(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
