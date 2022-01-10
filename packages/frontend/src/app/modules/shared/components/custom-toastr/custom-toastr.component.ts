import { CustomToastService } from "./../../services/custom-toast.service";
import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subscription } from "rxjs";
import { CustomToast } from "../../types/CustomToast.type";

@Component({
  selector: "app-custom-toastr",
  templateUrl: "./custom-toastr.component.html",
  styleUrls: ["./custom-toastr.component.css"],
})
export class CustomToastrComponent implements OnInit, OnDestroy {
  public toast: CustomToast;
  public customToastSubscription: Subscription = new Subscription();

  constructor(public customToastService: CustomToastService) {
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
