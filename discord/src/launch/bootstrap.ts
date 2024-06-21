import type { IAppMode } from "./app-mode";

export class BootstrapAppMode implements IAppMode {
    name = "bootstrap";

    execute(): void {}
}
