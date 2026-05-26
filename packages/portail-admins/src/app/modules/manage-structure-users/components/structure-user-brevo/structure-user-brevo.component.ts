import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { AdminUsersApiClient } from "../../../shared/services";
import { UserBrevoTabComponent } from "../../../shared/components/user-brevo-tab/user-brevo-tab.component";
import {
  BrevoEventsFetcher,
  BrevoStatusFetcher,
  BrevoUnblockFetcher,
} from "../../../shared/components/user-brevo-tab/user-brevo-tab.types";

@Component({
  selector: "app-structure-user-brevo",
  templateUrl: "./structure-user-brevo.component.html",
  imports: [CommonModule, UserBrevoTabComponent],
})
export class StructureUserBrevoComponent implements OnInit {
  public userUuid?: string;

  public readonly statusFetcher: BrevoStatusFetcher = (uuid) =>
    this.adminUsersApi.getStructureUserBrevoStatus(uuid);

  public readonly eventsFetcher: BrevoEventsFetcher = (uuid, options) =>
    this.adminUsersApi.getStructureUserEmailEvents(uuid, options);

  public readonly unblockFetcher: BrevoUnblockFetcher = (uuid) =>
    this.adminUsersApi.unblockStructureUserBrevoContact(uuid);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly adminUsersApi: AdminUsersApiClient
  ) {}

  public ngOnInit(): void {
    this.userUuid = this.route.parent?.snapshot.params["uuid"];
  }
}
