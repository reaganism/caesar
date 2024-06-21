export interface IAutoUpdater {
    setFeedUrl(updateUrl: string): void;
    quitAndInstall(): void;
    downloadAndInstallUpdate(()): void
}
