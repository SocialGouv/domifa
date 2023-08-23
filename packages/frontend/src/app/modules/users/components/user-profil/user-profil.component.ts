import { Subscription } from "rxjs";
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  DEFAULT_MODAL_OPTIONS,
  UserStructure,
  UserStructureProfile,
  UserStructureRole,
} from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-user-profil",
  templateUrl: "./user-profil.component.html",
})
export class UserProfilComponent implements OnInit, OnDestroy {
  public users: UserStructureProfile[];
  public me!: UserStructure | null;

  public selectedUser: UserStructureProfile | null;
  public loading: boolean;
  public displayUserRightsHelper: boolean;
  private subscription = new Subscription();

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.users = [];
    this.loading = false;
    this.selectedUser = null;
    this.displayUserRightsHelper = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer les utilisateurs de DomiFa");

    this.me = this.authService.currentUserValue;

    if (this.me) {
      this.getUsers();
    }
  }

  public updateRole(uuid: string, role: UserStructureRole): void {
    this.loading = true;
    this.subscription.add(
      this.userService.updateRole(uuid, role).subscribe({
        next: (user: UserStructureProfile) => {
          this.getUsers();

          this.toastService.success(
            "Les droits de " +
              user.nom +
              " " +
              user.prenom +
              " ont été mis à jour avec succès"
          );
        },
        error: () => {
          this.loading = false;
          this.toastService.error(
            "Impossible de mettre à jour le rôle de l'utilisateur"
          );
        },
      })
    );
  }

  public deleteUser(): void {
    if (this.selectedUser?.uuid) {
      this.loading = true;
      this.subscription.add(
        this.userService.deleteUser(this.selectedUser.uuid).subscribe({
          next: () => {
            this.toastService.success("Utilisateur supprimé avec succès");

            setTimeout(() => {
              this.modalService.dismissAll();
              this.getUsers();
            }, 1000);
          },
          error: () => {
            this.loading = false;
            this.toastService.error("Impossible de supprimer l'utilisateur");
          },
        })
      );
    }
  }

  public open(content: TemplateRef<NgbModalRef>): void {
    this.modalService.open(content, DEFAULT_MODAL_OPTIONS);
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public getUsers(): void {
    this.subscription.add(
      this.userService.getUsers().subscribe((users: UserStructureProfile[]) => {
        this.users = users;
        this.loading = false;
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
