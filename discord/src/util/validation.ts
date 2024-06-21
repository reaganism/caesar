export function assertNotNull<T>(value: T | null | undefined): T {
    if (value === null || value === undefined) {
        throw new Error("Assertion failed: value is null or undefined");
    }

    return value;
}
