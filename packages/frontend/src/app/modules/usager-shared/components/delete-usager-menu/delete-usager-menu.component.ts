import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../usager-profil/services/usager-profil.service";
import { UsagerDecisionService } from "../../services/usager-decision.service";

@Component({
  selector: "app-delete-usager-menu",
  templateUrl: "./delete-usager-menu.component.html",
})
export class DeleteUsagerMenuComponent implements OnInit {
  @Input() public usager!: UsagerLight;
  public me: UserStructure;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private usagerProfilService: UsagerProfilService,
    private usagerDecisionService: UsagerDecisionService,
    private toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.authService.currentUserSubject.subscribe((user: UserStructure) => {
      this.me = user;
    });
  }

  public getPreviousStatus(): string {
    return this.usager.historique[1].statut;
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
        this.modalService.dismissAll();
        this.toastService.success("Usager supprimé avec succès");
        this.router.navigate(["/manage"]);
      },
      error: () => {
        this.toastService.error("Impossible de supprimer la fiche");
      },
    });
  }

  public deleteRenew(): void {
    this.usagerDecisionService.deleteRenew(this.usager.ref).subscribe(
      () => {
        this.modalService.dismissAll();
        this.toastService.success(
          "Demande de renouvellement supprimée avec succès"
        );
        this.router.navigate(["/manage"]);
      },
      () => {
        this.toastService.error(
          "La demande de renouvellement n'a pas pu être supprimée"
        );
      }
    );
  }
}
