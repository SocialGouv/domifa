import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subscription } from "rxjs";

import { USER_STRUCTURE_ROLES_LABELS, UsersForAdminList } from "@domifa/common";

import { DisplayLastLoginComponent } from "../../../shared/components/display-last-login/display-last-login.component";
import { selectAdminUserById } from "../../../shared/store/users";

@Component({
  selector: "app-structure-user-info",
  templateUrl: "./structure-user-info.component.html",
  imports: [CommonModule, RouterModule, DisplayLastLoginComponent],
})
export class StructureUserInfoComponent implements OnInit, OnDestroy {
  public user?: UsersForAdminList;

  public readonly USER_STRUCTURE_ROLES_LABELS = USER_STRUCTURE_ROLES_LABELS;

  private readonly subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store
  ) {}

  public ngOnInit(): void {
    const userId = Number.parseInt(
      this.route.parent?.snapshot.params["userId"] ?? "0",
      10
    );
    this.subscription.add(
      this.store.select(selectAdminUserById(userId)).subscribe((user) => {
        this.user = user;
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
