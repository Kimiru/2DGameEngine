import { GameComponent } from "../basics/GameObject.js";
export class StateMachine extends GameComponent {
    unique = true;
    boundObject;
    state = [];
    updates = new Map();
    draws = new Map();
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
    addStateCallback(state, update = null, draw = null, postState = false) {
        let stateString = this.#computeStateString(state, postState);
        if (update) {
            if (!this.updates.has(stateString))
                this.updates.set(stateString, []);
            this.updates.get(stateString).push(update);
        }
        if (draw) {
            if (!this.draws.has(stateString))
                this.draws.set(stateString, []);
            this.draws.get(stateString).push(draw);
        }
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
            for (let callback of this.updates.get(stateString) ?? []) {
                nextState = callback(this.boundObject, dt);
                if (!nextState)
                    continue;
                break stateLoop;
            }
            state.push(this.state[state.length]);
        }
        while (state.length != 0) {
            let stateString = this.#computeStateString(state, true);
            for (let callback of this.updates.get(stateString) ?? [])
                callback(this.boundObject, dt);
            state.pop();
        }
        for (let callback of this.updates.get(this.#computeStateString([], true)) ?? [])
            callback(this.boundObject, dt);
        if (nextState)
            this.state = nextState;
    }
    draw(ctx) {
        let state = [];
        while (state.length < this.state.length + 1) {
            let stateString = this.#computeStateString(state);
            for (let draw of this.draws.get(stateString) ?? [])
                draw(this.boundObject, ctx);
            state.push(this.state[state.length]);
        }
        while (state.length != 0) {
            let stateString = this.#computeStateString(state, true);
            for (let draw of this.draws.get(stateString) ?? [])
                draw(this.boundObject, ctx);
            state.pop();
        }
        for (let draw of this.draws.get(this.#computeStateString([], true)) ?? [])
            draw(this.boundObject, ctx);
    }
}
