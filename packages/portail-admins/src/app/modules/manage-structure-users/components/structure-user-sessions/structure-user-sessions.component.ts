import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { UserSessionsTabComponent } from "../../../shared/components/user-sessions-tab/user-sessions-tab.component";
import { SessionsUserProfile } from "../../../shared/components/user-sessions-tab/user-sessions.types";

@Component({
  selector: "app-structure-user-sessions",
  template: `<app-user-sessions-tab
    *ngIf="userUuid"
    [userType]="userType"
    [userUuid]="userUuid"
  ></app-user-sessions-tab>`,
  imports: [CommonModule, UserSessionsTabComponent],
})
export class StructureUserSessionsComponent implements OnInit {
  public userUuid?: string;
  public readonly userType: SessionsUserProfile = "user_structure";

  constructor(private readonly route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.userUuid = this.route.parent?.snapshot.params["uuid"];
  }
}
