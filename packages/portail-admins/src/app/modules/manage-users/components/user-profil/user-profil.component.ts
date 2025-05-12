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
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { subMonths } from "date-fns";

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

  @ViewChild("deleteUserConfirmationModal", { static: true })
  public deleteUserConfirmationModal!: TemplateRef<NgbModalRef>;

  @ViewChild("addUserModal", { static: true })
  public addUserModal!: TemplateRef<NgbModalRef>;

  @ViewChild("updateUserModal", { static: true })
  public updateUserModal!: TemplateRef<NgbModalRef>;

  public readonly faEdit = faEdit;
  public readonly faUserPlus = faUserPlus;
  public twoMonthsAgo = subMonths(new Date(), 2);

  constructor(
    private readonly authService: AdminAuthService,
    private readonly manageUsersService: ManageUsersService,
    private readonly modalService: NgbModal,
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
      this.users = users.map((user) => {
        return {
          ...user,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        };
      });
    });
  }

  public resetRoles() {
    this.selectedUser = null;
    this.expectedRole = null;
    this.newReferrerId = null;
    this.modalService.dismissAll();
  }

  public openDeleteConfirmation(user: UserSupervisor): void {
    this.selectedUser = user;
    this.modalService.open(
      this.deleteUserConfirmationModal,
      DEFAULT_MODAL_OPTIONS
    );
  }

  public openUpdateUserModal(user: UserSupervisor): void {
    this.selectedUser = user;
    this.modalService.open(this.updateUserModal, DEFAULT_MODAL_OPTIONS);
  }
  public openAddUserModal(): void {
    this.selectedUser = null;
    this.modalService.open(this.addUserModal, DEFAULT_MODAL_OPTIONS);
  }

  public closeModal(): void {
    this.selectedUser = null;
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
