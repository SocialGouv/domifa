import { Observable, Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { Store } from "@ngrx/store";

import {
  DEPARTEMENTS_LISTE,
  getUserStructureEmailStatus,
  PortailAdminUser,
  REGIONS_LISTE,
  SortValues,
  USER_STRUCTURE_EMAIL_STATUS_LABELS,
  USER_SUPERVISOR_ROLES_LABELS,
  UserStatus,
  UserStructureEmailStatus,
  UserSupervisor,
  UserSupervisorRole,
} from "@domifa/common";
import {
  USER_STATUS_LABELS,
  USER_STRUCTURE_EMAIL_STATUS_BADGE_CLASS,
} from "../../../shared/components/users-table/users-table.types";
import { isObsoleteUser } from "../../../manage-structure-users/utils/is-obsolete-user";

type SupervisorListRow = UserSupervisor & {
  emailStatus: UserStructureEmailStatus;
};
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import {
  selectAllSupervisors,
  selectIsSupervisorsLoading,
  SupervisorsActions,
} from "../../../shared/store/supervisors";
import { subMonths } from "date-fns";
import { DsfrModalComponent, DsfrModalModule } from "@edugouvfr/ngx-dsfr";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { DisplayLastLoginComponent } from "../../../shared/components/display-last-login/display-last-login.component";
import { RegisterUserSupervisorComponent } from "../register-user-supervisor/register-user-supervisor.component";
import { UserActionsComponent } from "../../../shared/components/user-actions/user-actions.component";
import {
  FilterTab,
  FilterTabsComponent,
} from "../../../shared/components/filter-tabs/filter-tabs.component";
import { UserStatusBadgeComponent } from "../../../shared/components/user-status-badge/user-status-badge.component";
import { FullNamePipe, SortArrayPipe } from "../../../shared/pipes";
import { matchesSearchTerm } from "../../../shared/utils/matches-search-term";

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
    FilterTabsComponent,
    UserStatusBadgeComponent,
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
  public statusFilter: UserStatus | "" = "";
  public obsoleteFilter: "ALL" | "OBSOLETE" = "ALL";
  public obsoleteCount = 0;
  public me!: PortailAdminUser | null;

  public readonly STATUS_OPTIONS: { value: UserStatus | ""; label: string }[] =
    [
      { value: "", label: "Tous les statuts" },
      { value: "ACTIVE", label: USER_STATUS_LABELS.ACTIVE },
      { value: "PENDING", label: USER_STATUS_LABELS.PENDING },
      {
        value: "TEMPORARILY_BLOCKED",
        label: USER_STATUS_LABELS.TEMPORARILY_BLOCKED,
      },
      { value: "BLOCKED", label: USER_STATUS_LABELS.BLOCKED },
      { value: "DELETE", label: USER_STATUS_LABELS.DELETE },
    ];

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

  public readonly loading$: Observable<boolean>;
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
    private readonly store: Store,
    private readonly titleService: Title
  ) {
    this.users = [];
    this.sortValue = "asc";
    this.currentKey = "nom";
    this.selectedUser = null;
    this.loading$ = this.store.select(selectIsSupervisorsLoading);
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer les utilisateurs de DomiFa");

    this.me = this.authService.currentUserValue;

    this.subscription.add(
      this.store.select(selectAllSupervisors).subscribe((users) => {
        this.users = users.map((user) => ({
          ...user,
          emailStatus: getUserStructureEmailStatus(user.email),
        }));
        this.computeRoleCounts(this.users);
        this.obsoleteCount = this.users.filter(isObsoleteUser).length;
        this.applyFilter();
      })
    );

    this.store.dispatch(SupervisorsActions.loadIfNeeded());
  }

  public applyFilter(): void {
    const { searchTerm, emailStatusFilter, roleFilter, obsoleteFilter } = this;
    const statusFilter = this.statusFilter;
    this.filteredUsers = this.users.filter((user) => {
      if (statusFilter && user.status !== statusFilter) {
        return false;
      }
      if (roleFilter !== "ALL" && user.role !== roleFilter) {
        return false;
      }
      if (obsoleteFilter === "OBSOLETE" && !isObsoleteUser(user)) {
        return false;
      }
      if (emailStatusFilter && user.emailStatus !== emailStatusFilter) {
        return false;
      }
      return matchesSearchTerm(user, searchTerm, [
        "id",
        "uuid",
        "nom",
        "prenom",
        "email",
      ]);
    });
  }

  public selectRole(role: string): void {
    this.roleFilter = role as UserSupervisorRole | "ALL";
    this.applyFilter();
  }

  public get roleTabs(): FilterTab[] {
    return [
      { key: "ALL", label: "Tous", count: this.users.length },
      {
        key: "super-admin-domifa",
        label: USER_SUPERVISOR_ROLES_LABELS["super-admin-domifa"],
        count: this.roleCounts["super-admin-domifa"],
      },
      {
        key: "national",
        label: USER_SUPERVISOR_ROLES_LABELS["national"],
        count: this.roleCounts["national"],
      },
      {
        key: "region",
        label: USER_SUPERVISOR_ROLES_LABELS["region"],
        count: this.roleCounts["region"],
      },
      {
        key: "department",
        label: USER_SUPERVISOR_ROLES_LABELS["department"],
        count: this.roleCounts["department"],
      },
    ];
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
    this.store.dispatch(SupervisorsActions.load());
  }

  public userIdTrackBy(_index: number, user: SupervisorListRow) {
    return user.uuid;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
