import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UserStructure } from "../../../../../../../_common/model";
import { ETAPES_DEMANDE_URL } from "../../../../../../../_common/model/usager/constants";
import { UsagerFormModel } from "../../UsagerFormModel";

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

  public etapesUrl: string[];
  public me: UserStructure;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notifService: ToastrService
  ) {
    this.etapesUrl = ETAPES_DEMANDE_URL;
  }

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
      this.notifService.warning(
        "Vous ne pouvez pas revenir en arrière quand le dossier est en attente de décision"
      );
      return;
    }

    if (this.usager.ref === 0) {
      this.notifService.warning(
        "Vous devez remplir la première étape avant de passer à la suite"
      );
    } else if (step > this.usager.etapeDemande) {
      this.notifService.warning(
        "Pour passer à la suite, vous devez cliquer sur Suivant"
      );
    } else {
      this.router.navigate([
        "usager/" + this.usager.ref + "/edit/" + this.etapesUrl[step],
      ]);
    }
  }
}
