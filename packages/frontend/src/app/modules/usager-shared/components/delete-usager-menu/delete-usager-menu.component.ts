import { UsagerLight } from "./../../../../../_common/model/usager/UsagerLight.type";
import { UsagerFormModel } from "./../../interfaces/UsagerFormModel";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import {
  USAGER_DECISION_STATUT_LABELS,
  UserStructure,
} from "../../../../../_common/model";

import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerProfilService } from "../../../usager-profil/services/usager-profil.service";
import { UsagerDecisionService } from "../../services/usager-decision.service";

@Component({
  styleUrls: ["./delete-usager-menu.component.css"],
  selector: "app-delete-usager-menu",
  templateUrl: "./delete-usager-menu.component.html",
})
export class DeleteUsagerMenuComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  @Output() usagerChanges = new EventEmitter<UsagerLight>();

  public hasHistorique: boolean;
  public previousStatus: string;
  public loading: boolean;

  constructor(
    private router: Router,

    private modalService: NgbModal,
    private usagerProfilService: UsagerProfilService,
    private usagerDecisionService: UsagerDecisionService,
    private toastService: CustomToastService
  ) {
    this.loading = false;
    this.hasHistorique = false;
  }

  public ngOnInit(): void {
    this.hasHistorique =
      typeof this.usager.historique.find(
        (decision) =>
          decision.statut === "REFUS" ||
          decision.statut === "RADIE" ||
          decision.statut === "VALIDE"
      ) !== "undefined";

    this.getPreviousStatus();
  }

  public getPreviousStatus(): void {
    // On tri du plus récent au plus ancien
    const historique = this.usager.historique.sort((a, b) => {
      return (
        new Date(a.dateDecision).getTime() - new Date(b.dateDecision).getTime()
      );
    });

    // Fix temporaire = si instruction dans l'historique, on prend la valeure juste avant
    const index =
      historique[historique.length - 1].statut === "INSTRUCTION" ? 2 : 1;

    this.previousStatus =
      USAGER_DECISION_STATUT_LABELS[
        historique[historique.length - index].statut
      ];
  }

  public open(content: TemplateRef<NgbModalRef>): void {
    this.modalService.open(content);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public deleteUsager(): void {
    this.loading = true;
    this.usagerProfilService.delete(this.usager.ref).subscribe({
      next: () => {
        this.toastService.success("Usager supprimé avec succès");
        setTimeout(() => {
          this.modalService.dismissAll();
          this.loading = false;
          this.router.navigate(["/manage"]);
        }, 1000);
      },
      error: () => {
        this.loading = false;
        this.toastService.error("Impossible de supprimer la fiche");
      },
    });
  }

  public deleteRenew(): void {
    this.loading = true;
    this.usagerDecisionService.deleteRenew(this.usager.ref).subscribe({
      next: (usager: UsagerLight) => {
        this.toastService.success(
          "Demande de renouvellement supprimée avec succès"
        );
        this.usagerChanges.emit(usager);

        this.usager = new UsagerFormModel(usager);

        setTimeout(() => {
          this.modalService.dismissAll();
          this.loading = false;
          this.router.navigate(["profil/general/" + this.usager.ref]);
        }, 1000);
      },
      error: () => {
        this.loading = false;
        this.toastService.error(
          "La demande de renouvellement n'a pas pu être supprimée"
        );
      },
    });
  }
}
