import { Component } from "@angular/core";
import { Toast, ToastPackage, ToastrService } from "ngx-toastr";

@Component({
  selector: "app-custom-toastr",
  templateUrl: "./custom-toastr.component.html",
  animations: [],
  styleUrls: ["./custom-toastr.component.css"],
})
export class CustomToastrComponent extends Toast {
  // used for demo purposes
  undoString = "undo";
  // constructor is only necessary when not using AoT
  constructor(
    protected toastrService: ToastrService,
    public toastPackage: ToastPackage
  ) {
    super(toastrService, toastPackage);
    console.log(this.toastPackage);
  }
}
