import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  UsagerDecision,
  UsagerHistoryStateCreationEvent,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  HISTORY_ACTIONS,
} from "../../../../../../_common/model";
import { AuthService } from "../../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../services/usager-profil.service";
import { BaseUsagerProfilPageComponent } from "../base-usager-profil-page/base-usager-profil-page.component";

@Component({
  selector: "app-profil-historique",
  templateUrl: "./profil-historique.component.html",
  styleUrls: ["./profil-historique.component.css"],
})
export class ProfilHistoriqueComponent extends BaseUsagerProfilPageComponent {
  public newHistorique: {
    decision: UsagerDecision;
    createdEvent: UsagerHistoryStateCreationEvent;
  }[];

  public readonly HISTORY_ACTIONS = HISTORY_ACTIONS;

  public readonly USAGER_DECISION_STATUT_LABELS_PROFIL =
    USAGER_DECISION_STATUT_LABELS_PROFIL;

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router
    );

    this.newHistorique = [];
    this.titlePrefix = "Historique";
  }
}