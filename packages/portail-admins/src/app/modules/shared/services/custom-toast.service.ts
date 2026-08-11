import { CustomToast } from "../types/CustomToast.type";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { CustomToastClass } from "../types";

@Injectable({
  providedIn: "root",
})
export class CustomToastService {
  public toast$: Subject<CustomToast> = new Subject();

  // Tracks the pending auto-hide timer so a new toast cancels any earlier
  // one instead of racing with it (an earlier timer used to blindly emit a
  // shared, stale "hide" object, which could hide a just-shown toast
  // immediately if two calls landed within the same 6s window).
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  public warning(message: string): void {
    this.launchToast(message, "warning");
  }

  public error(message: string): void {
    this.launchToast(message, "error");
  }

  public success(message: string): void {
    this.launchToast(message, "success");
  }

  public info(message: string): void {
    this.launchToast(message, "info");
  }

  public launchToast(message: string, className: CustomToastClass): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.toast$.next({
      display: true,
      message,
      class: className,
    });

    this.hideTimeout = setTimeout(() => {
      this.hideTimeout = null;
      this.toast$.next({
        display: false,
        message: "",
        class: "",
      });
    }, 6000);
  }
}
