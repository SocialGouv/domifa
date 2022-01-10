import { CustomToastService } from "./../../services/custom-toast.service";
import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subscription, debounceTime, BehaviorSubject } from "rxjs";
import { CustomToast } from "../../types/CustomType.type";

@Component({
  selector: "app-custom-toastr",
  templateUrl: "./custom-toastr.component.html",
  styleUrls: ["./custom-toastr.component.css"],
})
export class CustomToastrComponent implements OnInit, OnDestroy {
  public toast: CustomToast;
  public customToastSubscription: Subscription;

  constructor(private customToastService: CustomToastService) {
    this.toast = {
      display: false,
      message: null,
    };

    this.customToastSubscription = new Subscription();
  }

  public ngOnInit(): void {
    this.customToastSubscription = this.customToastService.toast$
      .pipe(debounceTime(200))
      .subscribe((value: CustomToast) => {
        this.toast = value;
      });
  }

  public ngOnDestroy(): void {
    this.customToastSubscription.unsubscribe();
  }
}
