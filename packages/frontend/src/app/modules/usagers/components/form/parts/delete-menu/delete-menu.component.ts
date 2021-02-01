import { Component, Input, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AppUser, UsagerLight } from "../../../../../../../_common/model";

@Component({
  providers: [UsagerService],
  selector: "app-form-delete-menu",
  templateUrl: "./delete-menu.component.html",
})
export class DeleteMenuComponent implements OnInit {
  @Input() public usager!: UsagerLight;

  public me: AppUser;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private usagerService: UsagerService,
    private notifService: ToastrService
  ) {}

  public ngOnInit() {
    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });
  }

  public open(content: TemplateRef<any>) {
    this.modalService.open(content);
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public deleteUsager() {
    this.usagerService.delete(this.usager.ref).subscribe(
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
    this.usagerService.deleteRenew(this.usager.ref).subscribe(
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
