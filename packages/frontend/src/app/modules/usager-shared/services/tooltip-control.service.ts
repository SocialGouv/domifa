import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TooltipControlService {
  closeTooltipsSubject = new Subject<void>();

  closeTooltips() {
    this.closeTooltipsSubject.next();
  }
}
