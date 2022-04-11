import { UsagerDecision } from "./../../../../../_common/model/usager/decision/UsagerDecision.type";
import { UsagerOptionsService } from "./../../services/usager-options.service";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  UsagerLight,
  UserStructure,
  UsagerOptionsHistory,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
  UsagerHistoryState,
  UsagerHistoryStateCreationEvent,
} from "../../../../../_common/model";
import { getUsagerNomComplet } from "../../../../shared/getUsagerNomComplet";
import { AuthService } from "../../../shared/services/auth.service";
import { Decision, UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagerService } from "../../../usagers/services/usager.service";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";

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
    private authService: AuthService,
    private usagerService: UsagerService,
    private usagerDecisionService: UsagerDecisionService,
    private usagerOptionsService: UsagerOptionsService,
    private titleService: Title,
    private toastService: CustomToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.me = null;
    this.transfertHistory = [];
    this.procurationHistory = [];
    this.newHistorique = [];
  }

  ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });

    this.usagerService.findOne(this.route.snapshot.params.id).subscribe({
      next: (usager: UsagerLight) => {
        {
          const name = getUsagerNomComplet(usager);
          this.titleService.setTitle("Historique de " + name);
          this.usager = new UsagerFormModel(usager);

          this.usager.historique = this.usager.historique.sort((a, b) => {
            return b.dateDecision.getTime() - a.dateDecision.getTime();
          });
          this.getHistoriqueDecisions();
          this.getHistoriqueOptions();
        }
      },
      error: () => {
        this.toastService.error("Le dossier recherché n'existe pas");
        this.router.navigate(["404"]);
      },
    });
  }

  public getHistoriqueDecisions(): void {
    console.log("getHistoriqueDecisions");
    this.usagerDecisionService
      .getHistoriqueDecisions(this.usager.ref)
      .subscribe({
        next: (historique: UsagerHistoryState[]) => {
          {
            console.log(historique);

            this.newHistorique = historique.map(
              (history: UsagerHistoryState) => {
                return {
                  decision: new Decision(history.decision),
                  createdEvent: history.createdEvent,
                };
              }
            );

            this.newHistorique = this.newHistorique.sort((a, b) => {
              return (
                b.decision.dateDecision.getTime() -
                a.decision.dateDecision.getTime()
              );
            });
            console.log(this.newHistorique);
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
        this.transfertHistory = optionsHistorique.filter(
          (history: UsagerOptionsHistory) => history.type === "transfert"
        );
        this.procurationHistory = optionsHistorique.filter(
          (history: UsagerOptionsHistory) => history.type === "procuration"
        );
      });
  }

  public onUsagerChanges(usager: UsagerLight): void {
    this.usager = new UsagerFormModel(usager);
  }
}
