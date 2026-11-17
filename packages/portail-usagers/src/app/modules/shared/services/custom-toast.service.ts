import { CustomToast, ToastSeverity } from "../types/CustomToast.type";
import { Injectable, signal, WritableSignal } from "@angular/core";
import { DsfrToastService } from "@edugouvfr/ngx-dsfr-ext";

@Injectable({
  providedIn: "root",
})
export class CustomToastService {
  public toast: CustomToast = {
    content: "",
    severity: undefined,
  };

  // The ngx-dsfr-ext toaster announces every toast in a single role="status"
  // container: messages are announced through dedicated live regions instead
  // (app.component.html), errors and warnings in a role="alert" one (RGAA 7.5)
  public readonly statusMessage = signal("");
  public readonly alertMessage = signal("");

  constructor(private toastService: DsfrToastService) {}

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

  public launchToast(content: string, severity: ToastSeverity): void {
    this.toastService.show({
      content,
      severity,
    });
    this.announce(
      content,
      severity === "error" || severity === "warning"
        ? this.alertMessage
        : this.statusMessage
    );
  }

  private announce(message: string, region: WritableSignal<string>): void {
    // empty the region first, so that the same message is announced again
    region.set("");
    setTimeout(() => region.set(message), 100);
  }
}
