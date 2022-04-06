import { UsagerFormModel } from "./../../interfaces/UsagerFormModel";
import { Component, Input, OnInit, TemplateRef } from "@angular/core";
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

  public previousStatus: string;

  constructor(
    private router: Router,

    private modalService: NgbModal,
    private usagerProfilService: UsagerProfilService,
    private usagerDecisionService: UsagerDecisionService,
    private toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.getPreviousStatus();
  }

  public getPreviousStatus(): void {
    this.previousStatus =
      USAGER_DECISION_STATUT_LABELS[
        this.usager.historique[this.usager.historique.length - 2].statut
      ];
  }

  public open(content: TemplateRef<NgbModalRef>): void {
    this.modalService.open(content);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public deleteUsager(): void {
    this.usagerProfilService.delete(this.usager.ref).subscribe({
      next: () => {
        this.toastService.success("Usager supprimé avec succès");
        setTimeout(() => {
          this.modalService.dismissAll();
          this.router.navigate(["/manage"]);
        }, 1000);
      },
      error: () => {
        this.toastService.error("Impossible de supprimer la fiche");
      },
    });
  }

  public deleteRenew(): void {
    this.usagerDecisionService.deleteRenew(this.usager.ref).subscribe({
      next: () => {
        this.toastService.success(
          "Demande de renouvellement supprimée avec succès"
        );

        setTimeout(() => {
          this.modalService.dismissAll();
          this.router.navigate(["/manage"]);
        }, 1000);
      },
      error: () => {
        this.toastService.error(
          "La demande de renouvellement n'a pas pu être supprimée"
        );
      },
    });
  }
}
