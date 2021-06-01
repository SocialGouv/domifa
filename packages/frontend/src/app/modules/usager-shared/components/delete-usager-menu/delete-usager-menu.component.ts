import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AppUser, UsagerLight } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsagerProfilService } from "../../../usager-profil/services/usager-profil.service";
import { UsagerService } from "../../../usagers/services/usager.service";

@Component({
  selector: "app-delete-usager-menu",
  templateUrl: "./delete-usager-menu.component.html",
})
export class DeleteUsagerMenuComponent implements OnInit {
  @Input() public usager!: UsagerLight;

  public me: AppUser;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private usagerProfilService: UsagerProfilService,
    private notifService: ToastrService
  ) {}

  public ngOnInit() {
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });
  }

  public getPreviousStatus(): string {
    return this.usager.historique[1].statut;
  }

  public open(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public deleteUsager() {
    this.usagerProfilService.delete(this.usager.ref).subscribe(
      () => {
        this.modalService.dismissAll();
        this.notifService.success("Usager supprimé avec succès");
        this.router.navigate(["/manage"]);
      },
      () => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }

  public deleteRenew() {
    this.usagerProfilService.deleteRenew(this.usager.ref).subscribe(
      () => {
        this.modalService.dismissAll();
        this.notifService.success(
          "Demande de renouvellement supprimée avec succès"
        );
        this.router.navigate(["/manage"]);
      },
      () => {
        this.notifService.error(
          "La demande de renouvellement n'a pas pu être supprimée"
        );
      }
    );
  }
}
