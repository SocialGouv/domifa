import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Observable, Subscription } from "rxjs";

import { UsersForAdminList, UserStatus } from "@domifa/common";

import {
  selectAllAdminUsers,
  selectIsAdminUsersLoading,
  UsersActions,
} from "../../../shared/store/users";
import { UsersTableComponent } from "../../../shared/components/users-table/users-table.component";
import { UserActionsComponent } from "../../../shared/components/user-actions/user-actions.component";
import { isObsoleteUser } from "../../utils/is-obsolete-user";

export type StructureUserStatusFilter = UserStatus | "ALL";
export type ObsoleteFilter = "ALL" | "OBSOLETE";

@Component({
  selector: "app-structure-users-list",
  templateUrl: "./structure-users-list.component.html",
  imports: [
    CommonModule,
    FormsModule,
    DsfrSpinnerComponent,
    UsersTableComponent,
    UserActionsComponent,
  ],
})
export class StructureUsersListComponent implements OnInit, OnDestroy {
  public users: UsersForAdminList[] = [];
  public filteredUsers: UsersForAdminList[] = [];
  public selectedStatus: StructureUserStatusFilter = "ALL";
  public obsoleteFilter: ObsoleteFilter = "ALL";
  public obsoleteCount = 0;
  public statusCounts: Record<UserStatus, number> = {
    ACTIVE: 0,
    PENDING: 0,
    BLOCKED: 0,
    TEMPORARILY_BLOCKED: 0,
    DELETE: 0,
  };
  public readonly loading$: Observable<boolean>;

  private readonly subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly titleService: Title
  ) {
    this.loading$ = this.store.select(selectIsAdminUsersLoading);
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Gérer les utilisateurs des structures");

    this.subscription.add(
      this.store.select(selectAllAdminUsers).subscribe((users) => {
        this.users = users;
        this.computeStatusCounts(users);
        this.obsoleteCount = users.filter(isObsoleteUser).length;
        this.applyFilter();
      })
    );

    this.store.dispatch(UsersActions.load());
  }

  public selectStatus(status: StructureUserStatusFilter): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  public onActionsRefresh(): void {
    this.store.dispatch(UsersActions.load());
  }

  public applyFilter(): void {
    this.filteredUsers = this.users.filter((user) => {
      if (
        this.selectedStatus !== "ALL" &&
        user.status !== this.selectedStatus
      ) {
        return false;
      }
      if (this.obsoleteFilter === "OBSOLETE" && !isObsoleteUser(user)) {
        return false;
      }
      return true;
    });
  }

  private computeStatusCounts(users: UsersForAdminList[]): void {
    const counts: Record<UserStatus, number> = {
      ACTIVE: 0,
      PENDING: 0,
      BLOCKED: 0,
      TEMPORARILY_BLOCKED: 0,
      DELETE: 0,
    };
    for (const user of users) {
      if (counts[user.status] !== undefined) {
        counts[user.status]++;
      }
    }
    this.statusCounts = counts;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
