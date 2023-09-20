import { Component, Input, OnDestroy, OnInit } from "@angular/core";

import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import {
  ETAPES_DEMANDE_URL,
  ETAPES_FORM_DOM,
  ETAPES_FORM_DOM_TITRES,
  UsagerLight,
} from "../../../../../_common/model";
import { getUsagerNomComplet, selectUsagerByRef } from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";

@Component({
  selector: "app-step-header",
  templateUrl: "./step-header.component.html",
  styleUrls: ["./step-header.component.css"],
})
export class StepHeaderComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public currentStep!: number;

  public readonly ETAPES_FORM_DOM_TITRES = ETAPES_FORM_DOM_TITRES;
  public readonly ETAPES_FORM_DOM = ETAPES_FORM_DOM;
  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;

  public nbNotes = 0;
  public currentUrl = "";

  private subscription = new Subscription();
  public isMobile: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly store: Store
  ) {
    this.isMobile = this.checkIfIsMobile();
  }

  public ngOnInit(): void {
    if (
      this.usager.decision.statut !== "ATTENTE_DECISION" &&
      this.usager.decision.statut !== "INSTRUCTION"
    ) {
      this.toastService.warning(
        "Vous ne pouvez pas revenir sur une décision déjà prise"
      );
      this.router.navigate(["/profil/general/" + this.usager.ref]);
      return;
    }

    if (
      this.usager.decision.statut === "ATTENTE_DECISION" &&
      this.currentStep !== 4
    ) {
      this.router.navigate(["usager/" + this.usager.ref + "/edit/decision"]);
      return;
    }

    let title = "Création de demande";

    if (this.usager.uuid) {
      title =
        this.usager.typeDom === "RENOUVELLEMENT"
          ? "Renouvellement de "
          : "Création de demande de ";

      title += getUsagerNomComplet(this.usager);
    }

    title +=
      ", étape " +
      (this.currentStep + 1) +
      " sur 5, " +
      ETAPES_FORM_DOM_TITRES[this.currentStep] +
      " - DomiFa";

    this.titleService.setTitle(title);

    this.subscription.add(
      this.store
        .select(selectUsagerByRef(this.usager.ref.toString()))
        .subscribe((usager: UsagerLight) => {
          this.nbNotes = usager?.nbNotes ?? 0;
        })
    );

    this.currentUrl = this.router.url;
  }

  public changeStep(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value, 10);

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

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
