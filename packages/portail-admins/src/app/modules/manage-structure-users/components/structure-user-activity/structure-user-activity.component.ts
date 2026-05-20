import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { PageResults } from "@domifa/common";

import { AdminUsersApiClient } from "../../../shared/services";
import {
  UserActivityLogsFetcher,
  UserActivityTabComponent,
} from "../../../shared/components/user-activity-tab/user-activity-tab.component";
import { UserActivityLog } from "../../../manage-users/types/user-activity-log";

@Component({
  selector: "app-structure-user-activity",
  templateUrl: "./structure-user-activity.component.html",
  imports: [CommonModule, UserActivityTabComponent],
})
export class StructureUserActivityComponent implements OnInit {
  public userId?: number;

  public readonly fetcher: UserActivityLogsFetcher = (
    userId,
    page,
    take
  ): Observable<PageResults<UserActivityLog>> =>
    this.adminUsersApi.getStructureUserLogs(userId, page, take);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly adminUsersApi: AdminUsersApiClient
  ) {}

  public ngOnInit(): void {
    this.userId = Number.parseInt(
      this.route.parent?.snapshot.params["userId"] ?? "0",
      10
    );
  }
}
