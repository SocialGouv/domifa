import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { PageResults } from "@domifa/common";

import { AdminStructuresApiClient } from "../../../shared/services/api/admin-structures-api-client.service";
import {
  UserActivityLogsFetcher,
  UserActivityTabComponent,
} from "../../../shared/components/user-activity-tab/user-activity-tab.component";
import { UserActivityLog } from "../../../manage-users/types/user-activity-log";

@Component({
  selector: "app-structure-activity",
  templateUrl: "./structure-activity.component.html",
  imports: [CommonModule, UserActivityTabComponent],
})
export class StructureActivityComponent implements OnInit {
  public structureUuid?: string;

  public readonly fetcher: UserActivityLogsFetcher = (
    structureUuid,
    page,
    take
  ): Observable<PageResults<UserActivityLog>> =>
    this.adminStructuresApi.getStructureLogs(structureUuid, page, take);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly adminStructuresApi: AdminStructuresApiClient
  ) {}

  public ngOnInit(): void {
    this.structureUuid = this.route.parent?.snapshot.params["structureUuid"];
  }
}
