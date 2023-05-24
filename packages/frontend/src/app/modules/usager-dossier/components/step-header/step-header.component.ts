import { UsagerNotesService } from "./../../../usager-notes/services/usager-notes.service";
import { Component, Input, OnInit } from "@angular/core";

import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";
import { ETAPES_DEMANDE_URL } from "../../../../../_common/model";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { getUsagerNomComplet } from "../../../../shared";
import { CustomToastService } from "../../../shared/services";
import { Subscription } from "rxjs";

@Component({
  selector: "app-step-header",
  templateUrl: "./step-header.component.html",
  styleUrls: ["./step-header.component.css"],
})
export class StepHeaderComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public currentStep!: number;

  public readonly ETAPES_FORM_DOM = [
    "État civil",
    "Prise de RDV",
    "Entretien",
    "Pièces justificatives",
    "Décision finale",
  ];

  public readonly ETAPES_FORM_DOM_TITRES = [
    "état-civil",
    "prise de rendez-vous",
    "entretien social",
    "pièces justificatives",
    "récapitulatif et prise de décision",
  ];

  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;

  public nbNotes: number;
  private subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly usagerNotesService: UsagerNotesService
  ) {
    this.nbNotes = 0;
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
      this.ETAPES_FORM_DOM_TITRES[this.currentStep];

    this.titleService.setTitle(title);

    if (this.usager.uuid) {
      this.subscription.add(
        this.usagerNotesService
          .countNotes(this.usager.ref)
          .subscribe((nbNotes: number) => {
            this.nbNotes = nbNotes;
          })
      );
    }
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
    }
  }

  public navigateToNotes(): void {
    const element = document.getElementById("private_notes");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }
}
