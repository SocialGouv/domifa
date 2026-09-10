import { Injectable } from "@angular/core";
import { captureMessage } from "@sentry/angular";

// Storage backend defaults to localStorage everywhere except explicitly
// requested otherwise — used by AuthService to keep the dedicated "support"
// account's session in sessionStorage (dies with the tab, no cross-tab
// sharing, no survives-a-browser-restart) while every other role keeps
// today's localStorage behaviour.
@Injectable({ providedIn: "root" })
export class SafeStorageService {
  private reported = false;

  public getItem(key: string, backend: Storage = localStorage): string | null {
    try {
      return backend.getItem(key);
    } catch (err) {
      this.reportOnce(err);
      return null;
    }
  }

  public setItem(
    key: string,
    value: string,
    backend: Storage = localStorage
  ): void {
    try {
      backend.setItem(key, value);
    } catch (err) {
      this.reportOnce(err);
    }
  }

  public removeItem(key: string, backend: Storage = localStorage): void {
    try {
      backend.removeItem(key);
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
