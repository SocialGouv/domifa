import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from "@angular/core";

import { Usager } from "src/app/modules/usagers/interfaces/usager";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";

import { User } from "src/app/modules/users/interfaces/user";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  providers: [UsagerService],
  selector: "app-form-delete-menu",
  templateUrl: "./delete-menu.component.html",
})
export class DeleteMenuComponent implements OnInit {
  @Input() public usager!: Usager;

  public me: User;
  public modal: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    private usagerService: UsagerService,
    private notifService: ToastrService
  ) {
    this.authService.currentUser.subscribe((user: User) => {
      this.me = user;
    });
  }

  public ngOnInit() {}

  public open(content: TemplateRef<any>) {
    this.modal = this.modalService.open(content);
  }
  public deleteUsager() {
    this.usagerService.delete(this.usager.id).subscribe(
      (result: any) => {
        this.modal.close();
        this.notifService.success("Usager supprimé avec succès");
        this.router.navigate(["/manage"]);
      },
      (error) => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }

  public deleteRenew() {
    this.usagerService.deleteRenew(this.usager.id).subscribe(
      (result: any) => {
        this.modal.close();
        this.notifService.success(
          "Demande de renouvellement supprimée avec succès"
        );
        this.router.navigate(["/manage"]);
      },
      (error) => {
        this.notifService.error("Impossible de supprimer la fiche");
      }
    );
  }
}
