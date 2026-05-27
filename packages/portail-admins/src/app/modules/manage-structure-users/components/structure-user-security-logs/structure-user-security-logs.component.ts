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
  selector: "app-structure-user-security-logs",
  templateUrl: "./structure-user-security-logs.component.html",
  imports: [CommonModule, UserActivityTabComponent],
})
export class StructureUserSecurityLogsComponent implements OnInit {
  public userUuid?: string;

  public readonly fetcher: UserActivityLogsFetcher = (
    userUuid,
    page,
    take
  ): Observable<PageResults<UserActivityLog>> =>
    this.adminUsersApi.getStructureUserSecurityLogs(userUuid, page, take);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly adminUsersApi: AdminUsersApiClient
  ) {}

  public ngOnInit(): void {
    this.userUuid = this.route.parent?.snapshot.params["uuid"];
  }
}
