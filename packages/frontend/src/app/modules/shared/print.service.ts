import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class PrintService {
  public printDiv(div: string) {
    const printContents = document.getElementById(div);
    if (!!printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
    }
  }
}
