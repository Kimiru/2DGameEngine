export declare class PID {
    #private;
    p: number;
    i: number;
    d: number;
    setpoint: number;
    constructor(p: number, i: number, d: number);
    error: number;
    cumulatedError: number;
    errorVariation: number;
    get value(): number;
    reset(): void;
    update(dt: number, currentValue: number): void;
}
