import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { PageResults, UserSupervisor } from "@domifa/common";

import { ManageUsersService } from "../../services/manage-users.service";
import {
  UserActivityLogsFetcher,
  UserActivityTabComponent,
} from "../../../shared/components/user-activity-tab/user-activity-tab.component";
import { UserActivityLog } from "../../types/user-activity-log";

@Component({
  selector: "app-supervisor-activity",
  templateUrl: "./supervisor-activity.component.html",
  imports: [CommonModule, UserActivityTabComponent],
})
export class SupervisorActivityComponent implements OnInit, OnDestroy {
  public userId?: number;

  public readonly fetcher: UserActivityLogsFetcher = (
    userId,
    page,
    take
  ): Observable<PageResults<UserActivityLog>> =>
    this.manageUsersService.getSupervisorUserLogs(userId, page, take);

  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly manageUsersService: ManageUsersService
  ) {}

  public ngOnInit(): void {
    const uuid = this.route.parent?.snapshot.params["uuid"];

    this.subscription.add(
      this.manageUsersService.users$.subscribe((users) => {
        const found = users.find((u: UserSupervisor) => u.uuid === uuid);
        if (found && found.id !== this.userId) {
          this.userId = found.id;
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
