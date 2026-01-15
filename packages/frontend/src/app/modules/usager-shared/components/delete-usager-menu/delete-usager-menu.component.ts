import { UsagerFormModel } from "./../../interfaces/UsagerFormModel";
import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";

import { UsagerLight } from "../../../../../_common/model";

import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerDecisionService } from "../../services/usager-decision.service";
import { Decision, DeleteUsagerContext } from "../../interfaces";
import { Subscription } from "rxjs";
import {
  USAGER_DECISION_STATUT_LABELS,
  UsagerDecisionStatut,
  UserStructure,
} from "@domifa/common";
import { getUrlUsagerProfil } from "../../utils";
import { AuthService } from "../../../shared/services";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  styleUrls: ["./delete-usager-menu.component.css"],
  selector: "app-delete-usager-menu",
  templateUrl: "./delete-usager-menu.component.html",
})
export class DeleteUsagerMenuComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public usager!: UsagerFormModel;
  @Input({ required: true }) public context!: DeleteUsagerContext;

  @ViewChild("deleteDecisionModal") deleteDecisionModal!: DsfrModalComponent;
  @ViewChild("deleteUsagerModal") deleteUsagerModal!: DsfrModalComponent;

  private readonly subscription = new Subscription();

  public previousStatus: string;
  public loading: boolean;
  public isAdmin: boolean;
  public me!: UserStructure | null;
  public selectedRefs: Set<number> = new Set<number>();

  public readonly DECISION_LABELS: {
    [key in UsagerDecisionStatut]: string;
  } = {
    VALIDE: "Domiciliation acceptée",
    INSTRUCTION: "Instruction du dossier",
    ATTENTE_DECISION: "Dossier mis en attente de décision",
    REFUS: "Dossier refusé",
    RADIE: "Dossier radié",
  };

  constructor(
    private readonly router: Router,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService
  ) {
    this.isAdmin = false;
    this.loading = false;

    this.previousStatus = "";
    this.me = this.authService.currentUserValue;
  }

  public ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.isAdmin = user?.role === "admin" || user?.role === "responsable";
    console.log(this.usager);
    this.selectedRefs.add(this.usager.ref);
    if (this.usager.historique.length > 1) {
      this.getPreviousStatus();
    }
  }

  public getPreviousStatus(): void {
    const historique: Decision[] = Object.assign([], this.usager.historique);
    historique.sort((a, b) => {
      return a.dateDecision.getTime() - b.dateDecision.getTime();
    });
    const statut = historique[historique.length - 2].statut;
    this.previousStatus = USAGER_DECISION_STATUT_LABELS[statut];
  }

  public openModal(modalId: string): void {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.showModal();
  }

  public closeModal(modalId: string): void {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.close();
  }

  public onDeleteClick(): void {
    if (this.context === "PROFIL") {
      this.openModal("modal-delete-usager");
    } else if (this.context === "INSTRUCTION_FORM") {
      if (this.usager.historique.length > 1) {
        this.openModal("modal-delete-decision");
      } else {
        this.openModal("modal-delete-usager");
      }
    }
  }

  public deleteDecision(): void {
    this.loading = true;
    this.subscription.add(
      this.usagerDecisionService.deleteDecision(this.usager).subscribe({
        next: (newUsager: UsagerLight) => {
          this.toastService.success("Décision supprimée avec succès");
          this.closeModal("modal-delete-decision");
          setTimeout(() => {
            this.loading = false;
            const redirection = getUrlUsagerProfil(newUsager);
            this.router.navigate([redirection]);
          }, 500);
        },
        error: () => {
          this.loading = false;
          this.toastService.error(
            "La demande décision n'a pas pu être supprimée"
          );
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
