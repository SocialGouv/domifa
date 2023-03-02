import { UsagerOptionsService } from "./../../../services/usager-options.service";
import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  UsagerOptionsHistory,
  UsagerDecision,
  UsagerHistoryStateCreationEvent,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
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
  public transfertHistory: UsagerOptionsHistory[];
  public procurationHistory: UsagerOptionsHistory[];

  public newHistorique: {
    decision: UsagerDecision;
    createdEvent: UsagerHistoryStateCreationEvent;
  }[];

  public readonly actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public readonly USAGER_DECISION_STATUT_LABELS_PROFIL =
    USAGER_DECISION_STATUT_LABELS_PROFIL;

  constructor(
    public authService: AuthService,
    public usagerProfilService: UsagerProfilService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    private readonly usagerOptionsService: UsagerOptionsService
  ) {
    super(
      authService,
      usagerProfilService,
      titleService,
      toastService,
      route,
      router
    );
    this.transfertHistory = [];
    this.procurationHistory = [];
    this.newHistorique = [];
    this.titlePrefix = "Historique";
  }

  public getHistoriqueOptions(): void {
    this.subscription.add(
      this.usagerOptionsService
        .findHistory(this.usager.ref)
        .subscribe((optionsHistorique: UsagerOptionsHistory[]) => {
          this.transfertHistory = optionsHistorique
            .filter(
              (history: UsagerOptionsHistory) => history.type === "transfert"
            )
            .sort((a: UsagerOptionsHistory, b: UsagerOptionsHistory) => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });

          this.procurationHistory = optionsHistorique
            .filter(
              (history: UsagerOptionsHistory) => history.type === "procuration"
            )
            .sort((a: UsagerOptionsHistory, b: UsagerOptionsHistory) => {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            });
        })
    );
  }
}
