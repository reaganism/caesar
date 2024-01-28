/**
 * Well-known timer types.
 */
export enum Timer {
    Initialization,
}

/**
 * Logs passed arguments (the message) under a given category.
 * @param category The category to log under.
 * @param args The arguments to log.
 */
export function log(category: string, ...args: any[]): void {
    console.log(`[\x1b[38;2;88;101;242mcaesar\x1b[0m > ${category}]`, ...args);
}

/**
 * Starts a timer.
 * @param timer The timer type to start.
 */
export function timerStart(timer: Timer): void {
    console.time(fullTimerName(timer));
}

/**
 * Ends a timer, logging the result.
 * @param timer The timer type to end.
 */
export function timerEnd(timer: Timer): void {
    console.timeEnd(fullTimerName(timer));
}

function fullTimerName(timer: Timer): string {
    return `[\x1b[38;2;88;101;242mcaesar\x1b[0m > ${timerName(timer)} (Timer)]`;
}

function timerName(timer: Timer): string {
    switch (timer) {
        case Timer.Initialization:
            return "Initialization";
    }
}
