import { concatMap, Subscription } from "rxjs";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { AuthService } from "../../../shared/services/auth.service";

import {
  UserStructureProfile,
  SortValues,
  UserStructure,
  UserStructureRole,
  USER_STRUCTURE_ROLES_LABELS,
  USER_FONCTION_LABELS,
} from "@domifa/common";
import { ManageUsersService } from "../../services/manage-users.service";

@Component({
  selector: "app-user-profil",
  templateUrl: "./user-profil.component.html",
  styleUrls: ["./user-profil.component.css"],
})
export class UserProfilComponent implements OnInit, OnDestroy {
  public users: UserStructureProfile[];
  public me!: UserStructure | null;

  public loading: boolean;
  public sortValue: SortValues;
  public currentKey: keyof UserStructureProfile;
  private readonly subscription = new Subscription();

  public selectedUser: UserStructureProfile | null;
  public newReferrerId: number | null = null;
  public expectedRole: UserStructureRole | null = null;

  public readonly USER_STRUCTURE_ROLES_LABELS = USER_STRUCTURE_ROLES_LABELS;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;

  @ViewChild("deleteModal")
  public deleteModal!: DsfrModalComponent;

  @ViewChild("assignReferrersModal")
  public assignReferrersModal!: DsfrModalComponent;

  @ViewChild("deleteUserConfirmationModal")
  public deleteUserConfirmationModal!: DsfrModalComponent;

  @ViewChild("addUserModal")
  public addUserModal!: DsfrModalComponent;

  @ViewChild("updateUserModal")
  public updateUserModal!: DsfrModalComponent;

  constructor(
    private readonly authService: AuthService,
    private readonly manageUsersService: ManageUsersService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.users = [];
    this.sortValue = "asc";
    this.currentKey = "nom";
    this.loading = false;
    this.selectedUser = null;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer les utilisateurs de DomiFa");

    this.me = this.authService.currentUserValue;
    this.getUsers();

    this.manageUsersService.users$.subscribe((users) => {
      this.loading = false;
      this.users = users;
    });
  }

  public openAssignReferrerModal(): void {
    this.assignReferrersModal.open();
  }

  public onRoleChange(user: UserStructure, newRole: UserStructureRole): void {
    if (newRole === "facteur" || newRole === "agent") {
      this.selectedUser = user;
      this.expectedRole = newRole;
      this.openAssignReferrerModal();
    } else {
      this.updateRole(user.uuid, newRole);
    }
  }

  public resetRoles(): void {
    this.selectedUser = null;
    this.expectedRole = null;
    this.newReferrerId = null;
    this.assignReferrersModal.close();
  }

  public updateRole(uuid: string, role: UserStructureRole): void {
    this.loading = true;
    this.subscription.add(
      this.manageUsersService.updateRole(uuid, role).subscribe({
        next: (user: UserStructureProfile) => {
          this.getUsers();
          this.toastService.success(
            "Les droits de " +
              user.nom +
              " " +
              user.prenom +
              " ont été mis à jour avec succès"
          );
          this.resetRoles();
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

  public openDeleteConfirmation(user: UserStructure): void {
    this.selectedUser = user;
    this.deleteUserConfirmationModal.open();
  }

  public openUpdateUserModal(user: UserStructure): void {
    this.selectedUser = user;
    this.updateUserModal.open();
  }

  public openAddUserModal(): void {
    this.selectedUser = null;
    this.addUserModal.open();
  }

  public closeModal(modal: "add" | "update" | "delete"): void {
    this.selectedUser = null;
    if (modal === "add") {
      this.addUserModal?.close();
    }

    if (modal === "update") {
      this.updateUserModal?.close();
    }

    if (modal === "delete") {
      this.deleteUserConfirmationModal?.close();
    }
  }

  public updateRoleAndReassign(): void {
    if (this.selectedUser?.uuid) {
      this.loading = true;
      this.subscription.add(
        this.manageUsersService
          .reassignReferrers(this.selectedUser, this.newReferrerId)
          .pipe(
            concatMap(() =>
              this.manageUsersService.updateRole(
                this.selectedUser!.uuid,
                this.expectedRole!
              )
            )
          )
          .subscribe({
            next: () => {
              this.getUsers();
              this.toastService.success(
                "Les droits de " +
                  this.selectedUser!.nom +
                  " " +
                  this.selectedUser!.prenom +
                  " ont été mis à jour avec succès"
              );
            },
            error: () => {
              this.loading = false;
              this.toastService.error(
                "Impossible de mettre à jour le rôle de l'utilisateur"
              );
            },
            complete: () => {
              this.loading = false;
            },
          })
      );
    }
  }

  public closeModals(): void {
    this.deleteModal?.close();
    this.assignReferrersModal?.close();
  }

  public getUsers(): void {
    this.closeModals();
    this.manageUsersService.loadUsers();
  }

  public userIdTrackBy(_index: number, user: UserStructureProfile) {
    return user.uuid;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
