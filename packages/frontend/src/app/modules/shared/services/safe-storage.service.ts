import { Injectable } from "@angular/core";
import { captureMessage } from "@sentry/angular";

@Injectable({ providedIn: "root" })
export class SafeStorageService {
  private reported = false;

  public getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      this.reportOnce(err);
      return null;
    }
  }

  public setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      this.reportOnce(err);
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      this.reportOnce(err);
    }
  }

  private reportOnce(err: unknown): void {
    if (this.reported) {
      return;
    }
    this.reported = true;
    captureMessage("localStorage_unavailable", {
      level: "warning",
      extra: {
        error: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : undefined,
      },
    });
  }
}
