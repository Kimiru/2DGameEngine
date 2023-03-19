import { GameComponent } from "../basics/GameObject.js";
export class StateMachine extends GameComponent {
    unique = true;
    boundObject;
    state = [];
    statesActions = new Map();
    constructor(boundObject, startState = [0]) {
        super('state-machine');
        this.boundObject = boundObject;
        this.state = startState;
    }
    setState(state) {
        this.state = state;
    }
    isState(state) {
        for (let index in state)
            if (state[index] !== this.state[index])
                return false;
        return true;
    }
    #computeStateString(state, postState = false) { return state.join('_') + (postState ? '_post' : ''); }
    addStateActions(state, stateActions, postState = false) {
        let stateString = this.#computeStateString(state, postState);
        if (!this.statesActions.has(stateString))
            this.statesActions.set(stateString, []);
        this.statesActions.get(stateString).push(stateActions);
    }
    /**
     * Execute the current state callback
     * If a callback in the chain, returns a non null value, the other callback in the chain will not be executed and the current state will change
     * Post state will always be executed, on the reached level, i.e. if root levels change state before, leaf levels, leaf level will not be executed (including they post callback), but the root level post callback will be executed
     *
     * @param dt
     */
    update(dt) {
        let state = [];
        let nextState = null;
        stateLoop: while (state.length < this.state.length + 1) {
            let stateString = this.#computeStateString(state);
            for (let stateActions of this.statesActions.get(stateString) ?? []) {
                nextState = stateActions.update?.(this.boundObject, dt) ?? null;
                if (!nextState)
                    continue;
                break stateLoop;
            }
            state.push(this.state[state.length]);
        }
        while (state.length != 0) {
            let stateString = this.#computeStateString(state, true);
            for (let stateActions of this.statesActions.get(stateString) ?? [])
                stateActions.update?.(this.boundObject, dt);
            state.pop();
        }
        for (let stateActions of this.statesActions.get(this.#computeStateString([], true)) ?? [])
            stateActions.update?.(this.boundObject, dt);
        if (nextState)
            this.state = nextState;
    }
    physics(dt) {
        let state = [];
        while (state.length < this.state.length + 1) {
            let stateString = this.#computeStateString(state);
            for (let stateActions of this.statesActions.get(stateString) ?? [])
                stateActions.physics?.(this.boundObject, dt);
            state.push(this.state[state.length]);
        }
        while (state.length != 0) {
            let stateString = this.#computeStateString(state, true);
            for (let stateActions of this.statesActions.get(stateString) ?? [])
                stateActions.physics?.(this.boundObject, dt);
            state.pop();
        }
        for (let stateActions of this.statesActions.get(this.#computeStateString([], true)) ?? [])
            stateActions.physics?.(this.boundObject, dt);
    }
    draw(ctx) {
        let state = [];
        while (state.length < this.state.length + 1) {
            let stateString = this.#computeStateString(state);
            for (let stateActions of this.statesActions.get(stateString) ?? [])
                stateActions.draw?.(this.boundObject, ctx);
            state.push(this.state[state.length]);
        }
        while (state.length != 0) {
            let stateString = this.#computeStateString(state, true);
            for (let stateActions of this.statesActions.get(stateString) ?? [])
                stateActions.draw?.(this.boundObject, ctx);
            state.pop();
        }
        for (let stateActions of this.statesActions.get(this.#computeStateString([], true)) ?? [])
            stateActions.draw?.(this.boundObject, ctx);
    }
}
