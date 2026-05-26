import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { UserBrevoTabComponent } from "../../../shared/components/user-brevo-tab/user-brevo-tab.component";
import {
  BrevoEventsFetcher,
  BrevoStatusFetcher,
  BrevoUnblockFetcher,
} from "../../../shared/components/user-brevo-tab/user-brevo-tab.types";
import { ManageUsersService } from "../../services/manage-users.service";

@Component({
  selector: "app-supervisor-brevo",
  templateUrl: "./supervisor-brevo.component.html",
  imports: [CommonModule, UserBrevoTabComponent],
})
export class SupervisorBrevoComponent implements OnInit {
  public userUuid?: string;

  public readonly statusFetcher: BrevoStatusFetcher = (uuid) =>
    this.manageUsersService.getSupervisorBrevoStatus(uuid);

  public readonly eventsFetcher: BrevoEventsFetcher = (uuid, options) =>
    this.manageUsersService.getSupervisorEmailEvents(uuid, options);

  public readonly unblockFetcher: BrevoUnblockFetcher = (uuid) =>
    this.manageUsersService.unblockSupervisorBrevoContact(uuid);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly manageUsersService: ManageUsersService
  ) {}

  public ngOnInit(): void {
    this.userUuid = this.route.parent?.snapshot.params["uuid"];
  }
}
