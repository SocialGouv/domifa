export class AntivirusUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Antivirus scan unavailable", { cause });
    this.name = "AntivirusUnavailableError";
  }
}
