import { Vector } from "./2DGEMath.js"
import { Camera, GameComponent } from "./2DGameEngine.js"


export class CameraDragComponent extends GameComponent {

    componentTag: string = 'camera-drag'
    unique: boolean = true

    static leftButton = 0
    static rightButton = 1
    static middleButton = 2

    button: number
    scrollZoomEnabled: boolean

    constructor(button: number = 1, scrollZoomEnabled: boolean = true) {

        super()

        this.button = button
        this.scrollZoomEnabled = scrollZoomEnabled

    }

    onAdd(): void {
        if (!this.parent || !(this.parent instanceof Camera)) throw 'Parent of this component must be a Camera'
    }

    #target: Vector = null
    update(dt: number): void {

        let mouse = this.input.mouse

        let button: boolean = false
        if (this.button === 0) button = mouse.left
        else if (this.button === 1) button = mouse.right
        else if (this.button === 2) button = mouse.middle

        if (button) {

            if (!this.#target) this.#target = mouse.position.clone()

            let delta: Vector = this.#target.clone().sub(mouse.position)

            this.parent.transform.translation.add(delta)

        } else
            this.#target = null

        if (this.scrollZoomEnabled && mouse.scroll) {

            let scale = 1.1 ** mouse.scroll
            let delta = mouse.position.clone().sub(this.parent.transform.translation)

            this.parent.transform.translation.add(delta)
            this.parent.transform.scale.multS(scale)
            this.parent.transform.translation.sub(delta.multS(scale))

        }

    }

}

type State<T> = (object: T, dt: number) => number[] | null

export class StateMachine<T> extends GameComponent {

    componentTag: string = 'camera-drag'
    unique: boolean = true

    boundObject: T
    state: number[] = []

    states: Map<string, State<T>[]> = new Map()

    constructor(boundObject: T, startState: number[] = [0]) {

        super()

        this.boundObject = boundObject
        this.state = startState

    }

    setState(state: number[]) {

        this.state = state

    }

    isState(state: number[]): boolean {

        for (let index in state)
            if (state[index] !== this.state[index])
                return false

        return true

    }

    #computeStateString(state: number[], postState: boolean = false): string { return state.join('_') + (postState ? '_post' : '') }


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
    addStateCallback(state: number[], callback: State<T>, postState: boolean = false) {

        let stateString = this.#computeStateString(state, postState)

        if (!this.states.has(stateString)) this.states.set(stateString, [])

        this.states.get(stateString).push(callback)

    }

    /**
     * Execute the current state callback
     * If a callback in the chain, returns a non null value, the other callback in the chain will not be executed and the current state will change
     * Post state will always be executed, on the reached level, i.e. if root levels change state before, leaf levels, leaf level will not be executed (including they post callback), but the root level post callback will be executed
     * 
     * @param dt 
     */
    update(dt: number) {

        let state = []
        let nextState = null

        stateLoop: while (state.length < this.state.length + 1) {

            let stateString = this.#computeStateString(state)

            for (let callback of this.states.get(stateString) ?? []) {

                nextState = callback(this.boundObject, dt)

                if (!nextState) continue

                break stateLoop

            }

            state.push(this.state[state.length])

        }

        while (state.length != 0) {

            let stateString = this.#computeStateString(state, true)

            for (let callback of this.states.get(stateString) ?? [])
                callback(this.boundObject, dt)

            state.pop()

        }

        for (let callback of this.states.get(this.#computeStateString([], true)) ?? [])
            callback(this.boundObject, dt)

        if (nextState) this.state = nextState

    }


}