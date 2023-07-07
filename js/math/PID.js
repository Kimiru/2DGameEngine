export class PID {
    p;
    i;
    d;
    setpoint;
    constructor(p, i, d) {
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
