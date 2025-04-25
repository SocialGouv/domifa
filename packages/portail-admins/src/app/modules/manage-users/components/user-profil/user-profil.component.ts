import { Subscription } from "rxjs";
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

import {
  DEPARTEMENTS_LISTE,
  PortailAdminUser,
  REGIONS_LISTE,
  SortValues,
  USER_SUPERVISOR_ROLES_LABELS,
  UserSupervisor,
  UserSupervisorRole,
} from "@domifa/common";
import { ManageUsersService } from "../../services/manage-users.service";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { DEFAULT_MODAL_OPTIONS } from "../../../../shared";
import { faEdit } from "@fortawesome/free-regular-svg-icons";

@Component({
  selector: "app-user-profil",
  templateUrl: "./user-profil.component.html",
})
export class UserProfilComponent implements OnInit, OnDestroy {
  public users: UserSupervisor[];
  public me!: PortailAdminUser | null;

  public loading: boolean;
  public displayUserRightsHelper: boolean;
  public sortValue: SortValues;
  public currentKey: keyof UserSupervisor;
  private subscription = new Subscription();

  public selectedUser: UserSupervisor | null;
  public newReferrerId: number | null = null;
  public expectedRole: UserSupervisorRole | null = null;

  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;
  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public readonly USER_SUPERVISOR_ROLES_LABELS = USER_SUPERVISOR_ROLES_LABELS;

  @ViewChild("deleteUserConfirmation", { static: true })
  public deleteUserConfirmation!: TemplateRef<NgbModalRef>;

  @ViewChild("editUserConfirmation", { static: true })
  public editUserConfirmation!: TemplateRef<NgbModalRef>;

  public readonly faEdit = faEdit;
  constructor(
    private readonly authService: AdminAuthService,
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

  public onRoleChange(user: UserSupervisor, newRole: UserSupervisorRole): void {
    this.updateRole(user.uuid, newRole);
  }

  public resetRoles() {
    this.selectedUser = null;
    this.expectedRole = null;
    this.newReferrerId = null;
    this.modalService.dismissAll();
  }

  public updateRole(uuid: string, role: UserSupervisorRole): void {
    this.loading = true;
    this.subscription.add(
      this.manageUsersService.updateRole(uuid, role).subscribe({
        next: (user: UserSupervisor) => {
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

  public openDeleteConfirmation(user: UserSupervisor): void {
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

  public userIdTrackBy(_index: number, user: UserSupervisor) {
    return user.uuid;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
