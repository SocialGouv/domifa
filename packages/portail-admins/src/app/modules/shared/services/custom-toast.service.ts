import { CustomToast } from "../types/CustomToast.type";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { CustomToastClass } from "../types";

@Injectable({
  providedIn: "root",
})
export class CustomToastService {
  public toast$: Subject<CustomToast> = new Subject();
  public toast: CustomToast = {
    display: false,
    dissmissable: true,
    message: "",
    class: "",
  };

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
    this.toast$.next({
      display: true,
      dissmissable: true,
      message,
      class: className,
    });

    setTimeout(() => {
      this.toast.display = false;
      this.toast$.next(this.toast);
    }, 6000);
  }
}
