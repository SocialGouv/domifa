import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { PageResults } from "@domifa/common";

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
export class SupervisorActivityComponent implements OnInit {
  public userUuid?: string;

  public readonly fetcher: UserActivityLogsFetcher = (
    userUuid,
    page,
    take
  ): Observable<PageResults<UserActivityLog>> =>
    this.manageUsersService.getSupervisorUserLogs(userUuid, page, take);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly manageUsersService: ManageUsersService
  ) {}

  public ngOnInit(): void {
    this.userUuid = this.route.parent?.snapshot.params["uuid"];
  }
}
