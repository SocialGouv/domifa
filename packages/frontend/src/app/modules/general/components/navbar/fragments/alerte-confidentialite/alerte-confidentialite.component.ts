import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-alerte-confidentialite",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./alerte-confidentialite.component.html",
})
export class AlerteConfidentialiteComponent {
  public matomoInfo: boolean;
  constructor() {
    this.matomoInfo = false;
    this.initMatomo();
  }

  public closeMatomo(): void {
    this.matomoInfo = true;
    localStorage.setItem("matomo", "done");
  }

  public initMatomo(): void {
    const matomo = localStorage.getItem("matomo");
    this.matomoInfo = matomo === "done";
  }
}
