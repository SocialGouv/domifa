import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ETAPES_DEMANDE_URL } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { ETAPES_FORM_DOM_TITRES, ETAPES_FORM_DOM } from "../../constants";

@Component({
  selector: "app-form-stepper",
  templateUrl: "./form-stepper.component.html",
  styleUrls: ["./form-stepper.component.css"],
})
export class FormStepperComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public currentStep!: number;

  public readonly ETAPES_FORM_DOM_TITRES = ETAPES_FORM_DOM_TITRES;
  public readonly ETAPES_FORM_DOM = ETAPES_FORM_DOM;
  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;
  public isMobile = false;

  constructor(
    private readonly router: Router,
    private readonly toastService: CustomToastService
  ) {
    this.isMobile = this.checkIfIsMobile();
  }

  public changeStep(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number.parseInt(target.value, 10);

    this.goToStep(value);
  }

  public goToStep(step: number): void {
    if (this.usager.decision.statut === "ATTENTE_DECISION") {
      this.toastService.warning(
        "Vous ne pouvez pas revenir en arrière quand le dossier est en attente de décision"
      );
      return;
    }

    if (this.usager.uuid) {
      if (step > this.usager.etapeDemande) {
        this.toastService.warning(
          "Pour passer à la suite, vous devez cliquer sur Suivant"
        );
      } else {
        this.router.navigate([
          "usager/" +
            this.usager.ref +
            "/edit/" +
            this.ETAPES_DEMANDE_URL[step],
        ]);
      }
    } else {
      this.toastService.warning(
        "Pour passer à la suite, vous devez cliquer sur Suivant"
      );
    }
  }

  private checkIfIsMobile(): boolean {
    const userAgent = window.navigator.userAgent;
    const mobileDevices = [
      "Android",
      "iPhone",
      "Windows Phone",
      "iPad",
      "iPod",
    ];
    return mobileDevices.some((device) => userAgent.includes(device));
  }
}
