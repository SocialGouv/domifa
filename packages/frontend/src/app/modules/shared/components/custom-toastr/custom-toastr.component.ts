import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subscription } from "rxjs";
import { CustomToast } from "../../types/CustomToast.type";

import { CustomToastClass } from "../../types";
import { IconName } from "@fortawesome/fontawesome-svg-core";

import { CustomToastService } from "../../services";
import { fadeInOut } from "../../../../shared";

@Component({
  selector: "app-custom-toastr",
  templateUrl: "./custom-toastr.component.html",
  styleUrls: ["./custom-toastr.component.scss"],
  animations: [fadeInOut],
})
export class CustomToastrComponent implements OnInit, OnDestroy {
  public toast: CustomToast;
  public customToastSubscription: Subscription = new Subscription();

  public toastIcons: { [key in CustomToastClass]: IconName } = {
    success: "check-circle",
    warning: "exclamation-circle",
    error: "times-circle",
    info: "info-circle",
    "": "info-circle",
  };

  public icon: IconName;

  constructor(public readonly customToastService: CustomToastService) {
    this.toast = {
      display: false,
      message: "",
      class: "",
    };
    this.icon = "info-circle";
    this.customToastSubscription = new Subscription();
  }

  public ngOnInit(): void {
    this.customToastSubscription.add(
      this.customToastService.toast$.subscribe((value: CustomToast) => {
        this.toast = value;
        this.icon = this.toastIcons[this.toast.class];
      })
    );
  }

  public ngOnDestroy(): void {
    this.customToastSubscription.unsubscribe();
  }
}
