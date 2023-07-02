export type EnterCallback<T> = (object: T) => void
export type LeaveCallback<T> = (object: T) => void
export type UpdateCallback<T> = (object: T, dt: number) => (number[] | null)
export type PhysicsCallback<T> = (object: T, dt: number) => void
export type DrawCallback<T> = (object: T, ctx: CanvasRenderingContext2D) => void
export interface StateActions<T> {
    enter?: EnterCallback<T>
    leave?: EnterCallback<T>
    update?: UpdateCallback<T>
    physics?: PhysicsCallback<T>
    draw?: DrawCallback<T>

    [x: string | number | symbol]: unknown
}


export class StateMachine<T>  {

    unique: boolean = true

    boundObject: T
    state: number[] = []

    statesActions: { [s: string]: StateActions<T>[] } = {}

    constructor(boundObject: T, startState: number[] = [0]) {

        this.boundObject = boundObject
        this.state = startState

    }

    setState(state: number[]) {

        let stateString = this.#computeStateString(this.state)

        for (let stateActions of this.statesActions[stateString] ?? [])
            stateActions.leave?.(this.boundObject)

        this.state = state

        stateString = this.#computeStateString(this.state)

        for (let stateActions of this.statesActions[stateString] ?? [])
            stateActions.enter?.(this.boundObject)

    }

    isState(state: number[]): boolean {

        for (let index in state)
            if (state[index] !== this.state[index])
                return false

        return true

    }

    #computeStateString(state: number[], postState: boolean = false): string { return state.join('_') + (postState ? '_post' : '') }

    addStateActions(state: number[], stateActions: StateActions<T>, postState: boolean = false) {

        let stateString = this.#computeStateString(state, postState)

        if (!this.statesActions[stateString]) this.statesActions[stateString] = []

        this.statesActions[stateString].push(stateActions)

    }

    /**
     * Execute the current state callback
     * If a callback in the chain, returns a non null value, the other callback in the chain will not be executed and the current state will change
     * Post state will always be executed, on the reached level, i.e. if root levels change state before, leaf levels, leaf level will not be executed (including they post callback), but the root level post callback will be executed
     * 
     * @param dt 
     */
    update(dt: number) {

        let state: number[] = []
        let nextState: number[] | null = null

        stateLoop: while (state.length < this.state.length + 1) {

            let stateString = this.#computeStateString(state)

            for (let stateActions of this.statesActions[stateString] ?? []) {

                nextState = stateActions.update?.(this.boundObject, dt) ?? null

                if (!nextState) continue

                break stateLoop

            }

            state.push(this.state[state.length])

        }

        while (state.length != 0) {

            let stateString = this.#computeStateString(state, true)

            for (let stateActions of this.statesActions[stateString] ?? [])
                stateActions.update?.(this.boundObject, dt)

            state.pop()

        }

        for (let stateActions of this.statesActions[this.#computeStateString([], true)] ?? [])
            stateActions.update?.(this.boundObject, dt)

        if (nextState) {

            let stateString = this.#computeStateString(this.state)

            for (let stateActions of this.statesActions[stateString] ?? [])
                stateActions.leave?.(this.boundObject)

            this.state = nextState

            stateString = this.#computeStateString(this.state)

            for (let stateActions of this.statesActions[stateString] ?? [])
                stateActions.enter?.(this.boundObject)
        }

    }

    physics(dt: number): void {

        let state: number[] = []

        while (state.length < this.state.length + 1) {

            let stateString = this.#computeStateString(state)

            for (let stateActions of this.statesActions[stateString] ?? [])
                stateActions.physics?.(this.boundObject, dt)

            state.push(this.state[state.length])

        }

        while (state.length != 0) {

            let stateString = this.#computeStateString(state, true)

            for (let stateActions of this.statesActions[stateString] ?? [])
                stateActions.physics?.(this.boundObject, dt)

            state.pop()

        }

        for (let stateActions of this.statesActions[this.#computeStateString([], true)] ?? [])
            stateActions.physics?.(this.boundObject, dt)

    }

    draw(ctx: CanvasRenderingContext2D): void {

        let state: number[] = []

        while (state.length < this.state.length + 1) {

            let stateString = this.#computeStateString(state)

            for (let stateActions of this.statesActions[stateString] ?? [])
                stateActions.draw?.(this.boundObject, ctx)

            state.push(this.state[state.length])

        }

        while (state.length != 0) {

            let stateString = this.#computeStateString(state, true)

            for (let stateActions of this.statesActions[stateString] ?? [])
                stateActions.draw?.(this.boundObject, ctx)

            state.pop()

        }

        for (let stateActions of this.statesActions[this.#computeStateString([], true)] ?? [])
            stateActions.draw?.(this.boundObject, ctx)

    }

}