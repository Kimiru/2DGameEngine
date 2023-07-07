export class PID {

    p: number = 0
    i: number = 0
    d: number = 0

    setpoint: number = 0


    constructor(p: number, i: number, d: number) {

        this.p = p
        this.i = i
        this.d = d

    }

    error: number = 0
    cumulatedError: number = 0
    errorVariation: number = 0

    #value: number = 0
    get value() { return this.#value }

    reset() {

        this.error = 0
        this.cumulatedError = 0
        this.errorVariation = 0

    }

    update(dt: number, currentValue: number) {

        let lastError = this.error

        this.error = this.setpoint - currentValue
        this.cumulatedError += this.error * dt
        this.errorVariation = (this.error - lastError) / dt

        this.#value =
            this.p * this.error +
            this.i * this.cumulatedError +
            this.d * this.errorVariation

    }

}