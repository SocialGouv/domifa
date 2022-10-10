import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  UserStructure,
  UserStructureProfile,
  UserStructureRole,
} from "../../../../../_common/model";
import { AuthService } from "../../../shared/services/auth.service";
import { UsersService } from "../../services/users.service";

@Component({
  selector: "app-user-profil",
  styleUrls: ["./user-profil.component.css"],
  templateUrl: "./user-profil.component.html",
})
export class UserProfilComponent implements OnInit, OnDestroy {
  public users: UserStructureProfile[];
  public me!: UserStructure | null;

  public selectedUser: UserStructureProfile | null;
  public loading: boolean;
  public usersInfos: boolean;
  private subscriptions = new Subscription();

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
    this.usersInfos = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gestion des utilisateurs DomiFa");

    this.subscriptions.add(
      this.authService.currentUserSubject.subscribe((user: UserStructure) => {
        if (user !== null) {
          this.me = user;
          this.getUsers();
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public updateRole(id: number, role: UserStructureRole) {
    this.loading = true;
    this.userService.updateRole(id, role).subscribe({
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
    });
  }

  public deleteUser() {
    if (this.selectedUser) {
      this.loading = true;
      this.userService.deleteUser(this.selectedUser.id).subscribe({
        next: () => {
          this.toastService.success("Utilisateur supprimé avec succès");

          setTimeout(() => {
            this.modalService.dismissAll();
            this.getUsers();
            this.loading = false;
          }, 1000);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible de supprimer l'utilisateur");
        },
      });
    }
  }

  public open(content: TemplateRef<NgbModalRef>) {
    this.modalService.open(content);
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public getUsers(): void {
    this.userService.getUsers().subscribe((users: UserStructureProfile[]) => {
      this.users = users;
      this.loading = false;
    });
  }
}
