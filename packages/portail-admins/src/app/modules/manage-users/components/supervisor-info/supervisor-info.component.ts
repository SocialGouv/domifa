import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

import {
  DEPARTEMENTS_LISTE,
  REGIONS_LISTE,
  USER_SUPERVISOR_ROLES_LABELS,
  UserSupervisor,
} from "@domifa/common";

import { ManageUsersService } from "../../services/manage-users.service";
import { DisplayLastLoginComponent } from "../../../shared/components/display-last-login/display-last-login.component";

@Component({
  selector: "app-supervisor-info",
  templateUrl: "./supervisor-info.component.html",
  imports: [CommonModule, DisplayLastLoginComponent],
})
export class SupervisorInfoComponent implements OnInit, OnDestroy {
  public supervisor?: UserSupervisor;

  public readonly USER_SUPERVISOR_ROLES_LABELS = USER_SUPERVISOR_ROLES_LABELS;
  public readonly DEPARTEMENTS_LISTE = DEPARTEMENTS_LISTE;
  public readonly REGIONS_LISTE = REGIONS_LISTE;

  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly manageUsersService: ManageUsersService
  ) {}

  public ngOnInit(): void {
    const uuid = this.route.parent?.snapshot.params["uuid"];

    this.subscription.add(
      this.manageUsersService.users$.subscribe((users) => {
        this.supervisor = users.find((u) => u.uuid === uuid);
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
