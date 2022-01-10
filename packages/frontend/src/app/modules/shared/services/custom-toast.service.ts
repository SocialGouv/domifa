import { CustomToast } from "./../types/CustomType.type";
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
  };

  public warning(message: string): void {
    this.toast.message = message;
  }
  public error(message: string): void {
    this.toast.message = message;
  }
  public info(message: string): void {
    this.toast.message = message;
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
