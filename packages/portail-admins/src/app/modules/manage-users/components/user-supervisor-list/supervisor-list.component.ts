import { Subscription } from "rxjs";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";

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
import { subMonths } from "date-fns";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-supervisor-list",
  templateUrl: "./supervisor-list.component.html",
})
export class SupervisorListComponent implements OnInit, OnDestroy {
  public users: UserSupervisor[];
  public filteredUsers: UserSupervisor[] = [];
  public searchTerm = "";
  public me!: PortailAdminUser | null;

  public loading: boolean;
  public displayUserRightsHelper: boolean;
  public sortValue: SortValues;
  public currentKey: keyof UserSupervisor;
  public roleCounts: Record<UserSupervisorRole, number> = {
    "super-admin-domifa": 0,
    national: 0,
    region: 0,
    department: 0,
  };
  private readonly subscription = new Subscription();

  public selectedUser: UserSupervisor | null;
  public newReferrerId: number | null = null;
  public expectedRole: UserSupervisorRole | null = null;

  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;
  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public readonly USER_SUPERVISOR_ROLES_LABELS = USER_SUPERVISOR_ROLES_LABELS;

  @ViewChild("deleteUserConfirmationModal")
  public deleteUserConfirmationModal!: DsfrModalComponent;

  @ViewChild("addUserModal")
  public addUserModal!: DsfrModalComponent;

  @ViewChild("updateUserModal")
  public updateUserModal!: DsfrModalComponent;

  public twoMonthsAgo = subMonths(new Date(), 2);

  constructor(
    private readonly authService: AdminAuthService,
    private readonly manageUsersService: ManageUsersService,
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
          lastLogin: user?.lastLogin ? new Date(user.lastLogin) : null,
        };
      });
      this.computeRoleCounts(this.users);
      this.applyFilter();
    });
  }

  public applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
      return;
    }
    this.filteredUsers = this.users.filter((user) => {
      const haystack = [
        String(user.id),
        user.uuid,
        user.nom,
        user.prenom,
        user.email,
      ]
        .filter((v): v is string => !!v)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }

  private computeRoleCounts(users: UserSupervisor[]): void {
    const counts: Record<UserSupervisorRole, number> = {
      "super-admin-domifa": 0,
      national: 0,
      region: 0,
      department: 0,
    };
    for (const user of users) {
      if (counts[user.role] !== undefined) {
        counts[user.role]++;
      }
    }
    this.roleCounts = counts;
  }

  public resetRoles() {
    this.selectedUser = null;
    this.expectedRole = null;
    this.newReferrerId = null;
  }

  public openDeleteConfirmation(user: UserSupervisor): void {
    this.selectedUser = user;
    this.deleteUserConfirmationModal.open();
  }

  public openUpdateUserModal(user: UserSupervisor): void {
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

  public getUsers(): void {
    this.loading = true;
    this.manageUsersService.loadUsers();
  }

  public userIdTrackBy(_index: number, user: UserSupervisor) {
    return user.uuid;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
