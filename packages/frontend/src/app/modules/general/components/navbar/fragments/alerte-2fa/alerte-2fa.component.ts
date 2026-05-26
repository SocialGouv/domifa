import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

const STORAGE_KEY = "alerte-2fa-deploy";

@Component({
  selector: "app-alerte-2fa",
  imports: [CommonModule],
  templateUrl: "./alerte-2fa.component.html",
})
export class Alerte2faComponent {
  public hidden: boolean;

  constructor() {
    this.hidden = localStorage.getItem(STORAGE_KEY) === "done";
  }

  public close(): void {
    this.hidden = true;
    localStorage.setItem(STORAGE_KEY, "done");
  }
}
