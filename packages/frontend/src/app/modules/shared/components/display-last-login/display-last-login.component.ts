import { NgClass, NgIf } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { differenceInMonths, format } from "date-fns";
import { fr } from "date-fns/locale";

@Component({
  selector: "app-display-last-login",
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: "./display-last-login.component.html",
  styleUrl: "./display-last-login.component.css",
})
export class DisplayLastLoginComponent implements OnInit {
  @Input({ required: true }) lastLogin: Date | null = null;

  public badgeClass: string = "";
  public lastLoginFormatted: string = "";

  public showNeverUsed: boolean = false;
  public showInactive2Months: boolean = false;
  public showInactiveOneYear: boolean = false;
  public showLastLoginDate: boolean = false;

  ngOnInit(): void {
    this.computeStatus();
  }

  private computeStatus(): void {
    // Cas 1: Jamais connecté
    if (!this.lastLogin) {
      this.badgeClass = "fr-badge--error";
      this.showNeverUsed = true;
      return;
    }

    const loginDate = new Date(this.lastLogin);
    const monthsSinceLogin = differenceInMonths(new Date(), loginDate);
    this.lastLoginFormatted = format(loginDate, "dd/MM/yyyy", { locale: fr });

    // Cas 2: > 12 mois
    if (monthsSinceLogin > 12) {
      this.badgeClass = "fr-badge--error";
      this.showLastLoginDate = true;
      this.showInactiveOneYear = true;
    }
    // Cas 3: Entre 2 et 12 mois
    else if (monthsSinceLogin > 2) {
      this.badgeClass = "fr-badge--warning";
      this.showInactive2Months = true;
    }
    // Cas 4: < 2 mois
    else {
      this.badgeClass = "fr-badge--success";
      this.showLastLoginDate = true;
    }
  }
}
