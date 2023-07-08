export declare class PID {
    #private;
    p: number;
    i: number;
    d: number;
    tau: number;
    limitMin: number;
    limitMax: number;
    integrator: number;
    previousError: number;
    differentiator: number;
    previousValue: number;
    get value(): number;
    constructor(p: number, i: number, d: number, limitMin?: number, limitMax?: number);
    reset(): void;
    update(dt: number, setpoint: number, currentValue: number): number;
}
