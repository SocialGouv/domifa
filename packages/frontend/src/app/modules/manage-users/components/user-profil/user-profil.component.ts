import { Subscription } from "rxjs";
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
  UserDeleteMotif,
  USER_DELETE_MOTIF_LABELS,
  USER_DELETE_MOTIF_VALUES,
} from "@domifa/common";
import { ManageUsersService } from "../../services/manage-users.service";
import { concatMap } from "rxjs";

@Component({
  selector: "app-user-profil",
  templateUrl: "./user-profil.component.html",
  styleUrls: ["./user-profil.component.css"],
  standalone: false,
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
  public selectedRole: UserStructureRole | null = null;
  public deleteMotif: UserDeleteMotif | "" = "";

  public readonly USER_STRUCTURE_ROLES_LABELS = USER_STRUCTURE_ROLES_LABELS;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;
  public readonly deleteMotifOptions = USER_DELETE_MOTIF_VALUES.map((key) => ({
    key,
    label: USER_DELETE_MOTIF_LABELS[key],
  }));

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

  public get needsReferrerReassignment(): boolean {
    return this.selectedRole === "facteur" || this.selectedRole === "agent";
  }

  public openDeleteConfirmation(user: UserStructure): void {
    this.selectedUser = user;
    this.deleteMotif = "";
    this.newReferrerId = null;
    this.deleteUserConfirmationModal.open();
  }

  public deleteUser(): void {
    if (!this.selectedUser?.uuid || !this.deleteMotif) {
      return;
    }
    const motif = this.deleteMotif;
    this.loading = true;
    this.subscription.add(
      this.manageUsersService
        .reassignReferrers(this.selectedUser, this.newReferrerId)
        .pipe(
          concatMap(() =>
            this.manageUsersService.deleteUser(this.selectedUser!.uuid, motif)
          )
        )
        .subscribe({
          next: () => {
            this.toastService.success("Utilisateur supprimé avec succès");
            this.getUsers();
          },
          error: (error) => {
            this.loading = false;
            // The OTP interceptor opens the OTP modal and re-tries the call
            // when it sees an OTP_* error code; swallow the toast in that case.
            if (error?.error?.code?.startsWith?.("OTP_")) {
              return;
            }
            this.toastService.error("Impossible de supprimer l'utilisateur");
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }

  public openUpdateUserModal(user: UserStructureProfile): void {
    this.selectedUser = user;
    this.selectedRole = user.role;
    this.newReferrerId = null;
    this.updateUserModal.open();
  }

  public submitRoleChange(): void {
    if (
      this.selectedUser &&
      this.selectedRole &&
      this.selectedRole !== this.selectedUser.role
    ) {
      this.loading = true;
      this.subscription.add(
        this.manageUsersService
          .updateRole(
            this.selectedUser.uuid,
            this.selectedRole,
            this.needsReferrerReassignment ? this.newReferrerId : undefined
          )
          .subscribe({
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

  public closeModals(): void {
    this.deleteUserConfirmationModal?.close();
    this.updateUserModal?.close();
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
