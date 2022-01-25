import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  ETAPES_DEMANDE_URL,
  UserStructure,
} from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-form-menu",
  styleUrls: ["./menu.component.css"],
  templateUrl: "./menu.component.html",
})
export class MenuComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public currentStep!: number;

  public etapes = [
    "État civil",
    "Prise de RDV",
    "Entretien",
    "Pièces justificatives",
    "Décision finale",
  ];

  public etapesUrl = ETAPES_DEMANDE_URL;

  public me: UserStructure;

  constructor(
    private authService: AuthService,
    private router: Router,
    public toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    if (
      this.usager.decision.statut === "ATTENTE_DECISION" &&
      this.currentStep !== 4
    ) {
      this.router.navigate(["usager/" + this.usager.ref + "/edit/decision"]);
      return;
    }
  }

  public goToStep(step: number): void {
    if (this.usager.decision.statut === "ATTENTE_DECISION") {
      this.toastService.warning(
        "Vous ne pouvez pas revenir en arrière quand le dossier est en attente de décision"
      );
      return;
    }

    if (this.usager.ref) {
      if (step > this.usager.etapeDemande) {
        this.toastService.warning(
          "Pour passer à la suite, vous devez cliquer sur Suivant"
        );
      } else {
        this.router.navigate([
          "usager/" + this.usager.ref + "/edit/" + this.etapesUrl[step],
        ]);
      }
    }
  }
}
