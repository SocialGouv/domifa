import { CommonModule } from "@angular/common";
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
import { StatCardComponent } from "../../../shared/components/stat-card/stat-card.component";
import { UserActionsComponent } from "../../../shared/components/user-actions/user-actions.component";

@Component({
  selector: "app-structure-users-list",
  templateUrl: "./structure-users-list.component.html",
  imports: [
    CommonModule,
    DsfrSpinnerComponent,
    UsersTableComponent,
    StatCardComponent,
    UserActionsComponent,
  ],
})
export class StructureUsersListComponent implements OnInit, OnDestroy {
  public users: UsersForAdminList[] = [];
  public statusCounts: Record<UserStatus, number> = {
    ACTIVE: 0,
    PENDING: 0,
    BLOCKED: 0,
    TEMPORARILY_BLOCKED: 0,
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
      })
    );

    this.store.dispatch(UsersActions.load());
  }

  public onActionsRefresh(): void {
    this.store.dispatch(UsersActions.load());
  }

  private computeStatusCounts(users: UsersForAdminList[]): void {
    const counts: Record<UserStatus, number> = {
      ACTIVE: 0,
      PENDING: 0,
      BLOCKED: 0,
      TEMPORARILY_BLOCKED: 0,
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
