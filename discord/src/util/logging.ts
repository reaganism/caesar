export function log(category: string, ...args: any[]): void {
    console.log(`[\x1b[38;2;88;101;242mcaesar\x1b[0m > ${category}]`, ...args);
}

export enum Timer {
    Initialization,
}

export function time(timer: Timer): void {
    console.time(`[\x1b[38;2;88;101;242mcaesar\x1b[0m > ${timer}]`);
}

export function timeEnd(timer: Timer): void {
    console.timeEnd(`[\x1b[38;2;88;101;242mcaesar\x1b[0m > ${timer}]`);
}

function timerName(timer: Timer): string {
    switch (timer) {
        case Timer.Initialization:
            return "Initialization";
    }
}
