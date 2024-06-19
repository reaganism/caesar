export type {};

declare global {
    namespace NodeJS {
        // biome-ignore lint/suspicious/noEmptyInterface: <explanation>
        interface Process {
            // resourcesPath: string;
        }
    }
}
