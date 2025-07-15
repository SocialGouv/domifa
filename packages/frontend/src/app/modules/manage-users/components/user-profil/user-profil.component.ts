import { concatMap, Subscription } from "rxjs";
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";
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
})
export class UserProfilComponent implements OnInit, OnDestroy {
  public users: UserStructureProfile[];
  public me!: UserStructure | null;

  public loading: boolean;
  public displayUserRightsHelper: boolean;
  public sortValue: SortValues;
  public currentKey: keyof UserStructureProfile;
  private subscription = new Subscription();

  public selectedUser: UserStructureProfile | null;
  public newReferrerId: number | null = null;
  public expectedRole: UserStructureRole | null = null;

  public readonly USER_STRUCTURE_ROLES_LABELS = USER_STRUCTURE_ROLES_LABELS;
  public readonly USER_FONCTION_LABELS = USER_FONCTION_LABELS;

  @ViewChild("deleteUserConfirmation", { static: true })
  public deleteUserConfirmation!: TemplateRef<NgbModalRef>;

  @ViewChild("assignReferrersModal")
  public assignReferrersModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly authService: AuthService,
    private readonly manageUsersService: ManageUsersService,
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.users = [];
    this.sortValue = "asc";
    this.currentKey = "nom";
    this.loading = false;
    this.selectedUser = null;
    this.displayUserRightsHelper = false;
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
    this.modalService.open(this.assignReferrersModal, DEFAULT_MODAL_OPTIONS);
  }

  public onRoleChange(user: UserStructure, newRole: UserStructureRole): void {
    if (newRole === "facteur") {
      this.selectedUser = user;
      this.expectedRole = newRole;
      this.openAssignReferrerModal();
    } else {
      this.updateRole(user.uuid, newRole);
    }
  }

  public resetRoles() {
    this.selectedUser = null;
    this.expectedRole = null;
    this.newReferrerId = null;
    this.modalService.dismissAll();
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

  public updateRoleAndReassign(): void {
    this.loading = true;
    if (this.selectedUser?.uuid) {
      this.loading = true;
      this.subscription.add(
        this.manageUsersService
          .reassignReferrers(this.selectedUser, this.newReferrerId)
          .pipe(
            concatMap(() =>
              this.manageUsersService.updateRole(
                this.selectedUser.uuid,
                this.expectedRole
              )
            )
          )
          .subscribe({
            next: () => {
              this.getUsers();
              this.toastService.success(
                "Les droits de " +
                  this.selectedUser.nom +
                  " " +
                  this.selectedUser.prenom +
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

  public openDeleteConfirmation(user: UserStructure): void {
    this.selectedUser = user;
    this.modalService.open(this.deleteUserConfirmation, DEFAULT_MODAL_OPTIONS);
  }

  public closeModal(): void {
    this.modalService.dismissAll();
  }

  public getUsers(): void {
    this.modalService.dismissAll();
    this.manageUsersService.loadUsers();
  }

  public userIdTrackBy(_index: number, user: UserStructureProfile) {
    return user.uuid;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
