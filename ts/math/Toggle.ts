import { GameComponent } from "../2DGameEngine.js"

export class Toggle extends GameComponent {

    active: boolean = false

    #t: number = 0
    speed: number
    patternFunction: (t: number) => number
    #offValue: number
    #onValue: number

    constructor(patternFunction: (t: number) => number, speed: number = 1) {

        super('toggle')

        this.drawEnabled = false

        this.speed = speed
        this.patternFunction = patternFunction
        this.#offValue = this.patternFunction(0)
        this.#onValue = this.patternFunction(1)

    }

    get value(): number {

        if (this.#t <= 0) return this.#offValue
        if (this.#t >= 1) return this.#onValue

        return this.patternFunction(this.#t)

    }

    on() { this.active = true }

    off() { this.active = false }

    toggle() { this.active = !this.active }

    update(dt) {

        if (this.active)
            if (this.#t < 1)
                this.#t += dt * this.speed
            else
                this.#t = 1

        else
            if (this.#t > 0)
                this.#t -= dt * this.speed
            else
                this.#t = 0

    }

}