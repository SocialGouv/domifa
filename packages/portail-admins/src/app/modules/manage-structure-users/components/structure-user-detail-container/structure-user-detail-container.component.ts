import { CommonModule, Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { Subscription, take } from "rxjs";

import { UsersForAdminList } from "@domifa/common";

import {
  selectAdminUserByUuid,
  selectAreAdminUsersLoaded,
  UsersActions,
} from "../../../shared/store/users";
import { UserActionsComponent } from "../../../shared/components/user-actions/user-actions.component";

@Component({
  selector: "app-structure-user-detail-container",
  templateUrl: "./structure-user-detail-container.component.html",
  imports: [
    CommonModule,
    RouterModule,
    DsfrSpinnerComponent,
    UserActionsComponent,
  ],
})
export class StructureUserDetailContainerComponent
  implements OnInit, OnDestroy
{
  public user?: UsersForAdminList;
  public loading = true;

  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store,
    private readonly titleService: Title,
    private readonly location: Location
  ) {}

  public goBack(): void {
    // history.length is 1 when the user landed directly on this page (deep
    // link / hard refresh): there is nothing to go back to, so fall back to
    // the list URL. Otherwise location.back() preserves whatever query
    // string the list page carried (search / page / sort).
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(["/manage-structure-users"]);
    }
  }

  public ngOnInit(): void {
    const uuid = this.activatedRoute.snapshot.params["uuid"];

    this.store
      .select(selectAreAdminUsersLoaded)
      .pipe(take(1))
      .subscribe((loaded) => {
        if (!loaded) {
          this.store.dispatch(UsersActions.load());
        }
      });

    this.subscription.add(
      this.store.select(selectAdminUserByUuid(uuid)).subscribe((user) => {
        if (user) {
          this.user = user;
          this.titleService.setTitle(
            `${user.nom} ${user.prenom} - ${user.structureName}`
          );
          this.loading = false;
        } else {
          this.store
            .select(selectAreAdminUsersLoaded)
            .pipe(take(1))
            .subscribe((loaded) => {
              if (loaded) {
                this.loading = false;
                this.router.navigate(["/manage-structure-users"]);
              }
            });
        }
      })
    );
  }

  public onActionsRefresh(): void {
    this.store.dispatch(UsersActions.load());
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
