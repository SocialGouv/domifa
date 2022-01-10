import { CustomToast } from "../types/CustomToast.type";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CustomToastService {
  public toast$: Subject<CustomToast> = new Subject();
  public toast: CustomToast = {
    display: false,
    message: null,
    class: null,
  };

  public warning(message: string): void {
    this.toast.message = message;
    this.toast.class = "warning";
    this.launchToast();
  }

  public error(message: string): void {
    this.toast.message = message;
    this.toast.class = "error";

    this.launchToast();
  }

  public success(message: string): void {
    this.toast.message = message;
    this.toast.class = "success";
    this.launchToast();
  }

  public info(message: string): void {
    this.toast.message = message;
    this.toast.class = "info";
    this.launchToast();
  }

  public launchToast(): void {
    this.toast.display = true;
    this.toast$.next(this.toast);
    setTimeout(() => {
      this.toast.display = false;
      this.toast$.next(this.toast);
    }, 5000);
  }
}
