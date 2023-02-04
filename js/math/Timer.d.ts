/**
 * The Timer class is used to mesure time easily
 */
export declare class Timer {
    begin: number;
    /**
     * Create a new timer starting from now or a given setpoint
     *
     * @param time
     */
    constructor(time?: number);
    /**
     * Reset the timer
     */
    reset(): void;
    /**
     * Return the amount of time in ms since the timer was last reset
     */
    getTime(): number;
    /**
     * Return true if the time since the last reset is greather that the given amount in ms
     *
     * @param {number} amount in ms
     */
    greaterThan(amount: number): boolean;
    /**
     * Return true if the time since the last reset is less that the given amount in ms
     *
     * @param {number} amount
     */
    lessThan(amount: number): boolean;
}
