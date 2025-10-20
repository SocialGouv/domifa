import { CustomToast, ToastSeverity } from "../types/CustomToast.type";
import { Injectable } from "@angular/core";
import { DsfrToastService } from "@edugouvfr/ngx-dsfr-ext";

@Injectable({
  providedIn: "root",
})
export class CustomToastService {
  public toast: CustomToast = {
    content: "",
    severity: undefined,
  };

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
  }
}
