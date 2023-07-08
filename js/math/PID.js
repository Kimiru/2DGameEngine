import { minmax } from "./Utils.js";
export class PID {
    p = 0;
    i = 0;
    d = 0;
    tau = 0.000001;
    limitMin = 1;
    limitMax = 0;
    integrator = 0;
    previousError = 0;
    differentiator = 0;
    previousValue = 0;
    #value = 0;
    get value() { return this.#value; }
    constructor(p, i, d, limitMin = -1, limitMax = 1) {
        this.p = p;
        this.i = i;
        this.d = d;
        this.limitMin = limitMin;
        this.limitMax = limitMax;
        this.reset();
    }
    reset() {
        this.integrator = 0;
        this.previousError = 0;
        this.differentiator = 0;
        this.previousValue = 0;
        this.#value = 0;
    }
    update(dt, setpoint, currentValue) {
        let error = setpoint - currentValue;
        let proportional = this.p * error;
        this.integrator += .5 * this.i * dt * (error + this.previousError);
        let limitMinInt, limitMaxInt;
        if (this.limitMax > proportional)
            limitMaxInt = this.limitMax;
        else
            limitMaxInt = 0;
        if (this.limitMin < proportional)
            limitMinInt = this.limitMin;
        else
            limitMinInt = 0;
        this.integrator = minmax(limitMinInt, this.integrator, limitMaxInt);
        this.differentiator = (2 * this.d * (currentValue - this.previousValue) + (2 * this.tau - dt) * this.differentiator) / (2 * this.tau + dt);
        this.#value = minmax(this.limitMin, proportional + this.integrator + this.differentiator, this.limitMax);
        this.previousError = error;
        this.previousValue = currentValue;
        return this.value;
    }
}
