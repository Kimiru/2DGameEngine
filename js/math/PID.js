export class PID {
    p = 0;
    i = 0;
    d = 0;
    setpoint = 0;
    constructor(p, i, d) {
        this.p = p;
        this.i = i;
        this.d = d;
    }
    error = 0;
    cumulatedError = 0;
    errorVariation = 0;
    #value = 0;
    get value() { return this.#value; }
    reset() {
        this.error = 0;
        this.cumulatedError = 0;
        this.errorVariation = 0;
    }
    update(dt, currentValue) {
        let lastError = this.error;
        this.error = this.setpoint - currentValue;
        this.cumulatedError += this.error * dt;
        this.errorVariation = (this.error - lastError) / dt;
        this.#value =
            this.p * this.error +
                this.i * this.cumulatedError +
                this.d * this.errorVariation;
    }
}
