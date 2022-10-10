import { UsagerOptionsService } from "./../../services/usager-options.service";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  UsagerLight,
  UserStructure,
  UsagerOptionsHistory,
  UsagerDecision,
  UsagerHistoryStateCreationEvent,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
} from "../../../../../_common/model";
import { getUsagerNomComplet } from "../../../../shared/getUsagerNomComplet";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-profil-historique",
  templateUrl: "./profil-historique.component.html",
  styleUrls: ["./profil-historique.component.css"],
})
export class ProfilHistoriqueComponent implements OnInit {
  public me!: UserStructure;
  public usager!: UsagerFormModel;

  public DECISION_LABELS = USAGER_DECISION_STATUT_LABELS_PROFIL;

  public actions = {
    EDIT: "Modification",
    DELETE: "Suppression",
    CREATION: "Création",
  };

  public transfertHistory: UsagerOptionsHistory[];
  public procurationHistory: UsagerOptionsHistory[];

  public newHistorique: {
    decision: UsagerDecision;
    createdEvent: UsagerHistoryStateCreationEvent;
  }[];

  constructor(
    private readonly authService: AuthService,
    private readonly usagerService: UsagerService,
    private readonly usagerOptionsService: UsagerOptionsService,
    private readonly titleService: Title,
    private readonly toastService: CustomToastService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.transfertHistory = [];
    this.procurationHistory = [];
    this.newHistorique = [];
  }

  ngOnInit(): void {
    this.me = this.authService.currentUserValue;

    this.usagerService.findOne(this.route.snapshot.params.id).subscribe({
      next: (usager: UsagerLight) => {
        {
          this.usager = new UsagerFormModel(usager);
          const name = getUsagerNomComplet(usager);
          this.titleService.setTitle("Historique de " + name);

          this.getHistoriqueOptions();
        }
      },
      error: () => {
        this.toastService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      },
    });
  }

  public getHistoriqueOptions(): void {
    this.usagerOptionsService
      .findHistory(this.usager.ref)
      .subscribe((optionsHistorique: UsagerOptionsHistory[]) => {
        this.transfertHistory = optionsHistorique
          .filter(
            (history: UsagerOptionsHistory) => history.type === "transfert"
          )
          .sort((a: UsagerOptionsHistory, b: UsagerOptionsHistory) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

        this.procurationHistory = optionsHistorique
          .filter(
            (history: UsagerOptionsHistory) => history.type === "procuration"
          )
          .sort((a: UsagerOptionsHistory, b: UsagerOptionsHistory) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
      });
  }
}
