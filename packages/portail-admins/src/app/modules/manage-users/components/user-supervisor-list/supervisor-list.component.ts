import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import {
  DEPARTEMENTS_LISTE,
  getUserStructureEmailStatus,
  PortailAdminUser,
  REGIONS_LISTE,
  SortValues,
  USER_STRUCTURE_EMAIL_STATUS_LABELS,
  USER_SUPERVISOR_ROLES_LABELS,
  UserStructureEmailStatus,
  UserSupervisor,
  UserSupervisorRole,
} from "@domifa/common";
import { USER_STRUCTURE_EMAIL_STATUS_BADGE_CLASS } from "../../../shared/components/users-table/users-table.types";
import { isObsoleteUser } from "../../../manage-structure-users/utils/is-obsolete-user";

type SupervisorListRow = UserSupervisor & {
  emailStatus: UserStructureEmailStatus;
};
import { ManageUsersService } from "../../services/manage-users.service";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { subMonths } from "date-fns";
import { DsfrModalComponent, DsfrModalModule } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { DisplayLastLoginComponent } from "../../../shared/components/display-last-login/display-last-login.component";
import { RegisterUserSupervisorComponent } from "../register-user-supervisor/register-user-supervisor.component";
import { UserActionsComponent } from "../../../shared/components/user-actions/user-actions.component";
import { FullNamePipe, SortArrayPipe } from "../../../shared/pipes";

@Component({
  selector: "app-supervisor-list",
  templateUrl: "./supervisor-list.component.html",
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DsfrModalModule,
    DsfrSpinnerComponent,
    TableHeadSortComponent,
    DisplayLastLoginComponent,
    RegisterUserSupervisorComponent,
    UserActionsComponent,
    FullNamePipe,
    SortArrayPipe,
  ],
})
export class SupervisorListComponent implements OnInit, OnDestroy {
  public users: SupervisorListRow[];
  public filteredUsers: SupervisorListRow[] = [];
  public searchTerm = "";
  public emailStatusFilter: UserStructureEmailStatus | "" = "";
  public roleFilter: UserSupervisorRole | "ALL" = "ALL";
  public obsoleteFilter: "ALL" | "OBSOLETE" = "ALL";
  public obsoleteCount = 0;
  public me!: PortailAdminUser | null;

  public readonly EMAIL_STATUS_OPTIONS: {
    value: UserStructureEmailStatus | "";
    label: string;
  }[] = [
    { value: "", label: "Tous les emails" },
    {
      value: "PERSONAL",
      label: USER_STRUCTURE_EMAIL_STATUS_LABELS.PERSONAL,
    },
    {
      value: "GENERIC_SUSPECTED",
      label: USER_STRUCTURE_EMAIL_STATUS_LABELS.GENERIC_SUSPECTED,
    },
    {
      value: "GENERIC_CONFIRMED",
      label: USER_STRUCTURE_EMAIL_STATUS_LABELS.GENERIC_CONFIRMED,
    },
  ];
  public readonly USER_STRUCTURE_EMAIL_STATUS_LABELS =
    USER_STRUCTURE_EMAIL_STATUS_LABELS;
  public readonly USER_STRUCTURE_EMAIL_STATUS_BADGE_CLASS =
    USER_STRUCTURE_EMAIL_STATUS_BADGE_CLASS;

  public loading: boolean;
  public sortValue: SortValues;
  public currentKey: keyof SupervisorListRow;
  public roleCounts: Record<UserSupervisorRole, number> = {
    "super-admin-domifa": 0,
    national: 0,
    region: 0,
    department: 0,
  };
  private readonly subscription = new Subscription();

  public selectedUser: UserSupervisor | null;

  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;
  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public readonly USER_SUPERVISOR_ROLES_LABELS = USER_SUPERVISOR_ROLES_LABELS;

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
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer les utilisateurs de DomiFa");

    this.me = this.authService.currentUserValue;
    this.getUsers();

    this.subscription.add(
      this.manageUsersService.users$.subscribe((users) => {
        this.loading = false;
        this.users = users.map((user) => ({
          ...user,
          lastLogin: user?.lastLogin ? new Date(user.lastLogin) : null,
          emailStatus: getUserStructureEmailStatus(user.email),
        }));
        this.computeRoleCounts(this.users);
        this.obsoleteCount = this.users.filter(isObsoleteUser).length;
        this.applyFilter();
      })
    );
  }

  public applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const emailStatusFilter = this.emailStatusFilter;
    const roleFilter = this.roleFilter;
    const obsoleteFilter = this.obsoleteFilter;
    this.filteredUsers = this.users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) {
        return false;
      }
      if (obsoleteFilter === "OBSOLETE" && !isObsoleteUser(user)) {
        return false;
      }
      if (emailStatusFilter && user.emailStatus !== emailStatusFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
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

  public selectRole(role: UserSupervisorRole | "ALL"): void {
    this.roleFilter = role;
    this.applyFilter();
  }

  private computeRoleCounts(users: SupervisorListRow[]): void {
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

  public openUpdateUserModal(user: UserSupervisor): void {
    this.selectedUser = user;
    this.updateUserModal.open();
  }

  public openAddUserModal(): void {
    this.selectedUser = null;
    this.addUserModal.open();
  }

  public closeModal(modal: "add" | "update"): void {
    this.selectedUser = null;
    if (modal === "add") {
      this.addUserModal?.close();
    }
    if (modal === "update") {
      this.updateUserModal?.close();
    }
  }

  public getUsers(): void {
    this.loading = true;
    this.manageUsersService.loadUsers();
  }

  public userIdTrackBy(_index: number, user: SupervisorListRow) {
    return user.uuid;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
