import { CustomToastService } from "./../../services/custom-toast.service";
import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subscription } from "rxjs";
import { CustomToast } from "../../types/CustomToast.type";

import { transition, style, animate, trigger } from "@angular/animations";

@Component({
  selector: "app-custom-toastr",
  templateUrl: "./custom-toastr.component.html",
  styleUrls: ["./custom-toastr.component.css"],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("0.3s ease-in", style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class CustomToastrComponent implements OnInit, OnDestroy {
  public toast: CustomToast;
  public customToastSubscription: Subscription = new Subscription();

  public toastIcons = {
    success: "check-circle",
    warning: "exclamation-circle",
    error: "times-circle",
    info: "info-circle",
  };

  constructor(public customToastService: CustomToastService) {
    this.toast = {
      display: false,
      message: null,
      class: null,
    };
    this.customToastSubscription = new Subscription();
  }

  public ngOnInit(): void {
    this.customToastSubscription.add(
      this.customToastService.toast$.subscribe((value: CustomToast) => {
        this.toast = value;
      })
    );
  }

  public ngOnDestroy(): void {
    this.customToastSubscription.unsubscribe();
  }
}
