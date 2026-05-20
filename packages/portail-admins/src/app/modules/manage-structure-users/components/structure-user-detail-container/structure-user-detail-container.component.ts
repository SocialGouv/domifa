import { CommonModule, ViewportScroller } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { filter, Subscription, take } from "rxjs";

import { UsersForAdminList } from "@domifa/common";

import {
  selectAdminUserById,
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
  public activeTab: "infos" | "activity" = "infos";
  public loading = true;

  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store,
    private readonly titleService: Title,
    private readonly viewportScroller: ViewportScroller
  ) {
    this.subscription.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          const url = this.router.url;
          this.activeTab = url.endsWith("/activity") ? "activity" : "infos";
          this.viewportScroller.scrollToAnchor("subnav");
        })
    );
  }

  public ngOnInit(): void {
    const userId = Number.parseInt(
      this.activatedRoute.snapshot.params["userId"],
      10
    );

    this.store
      .select(selectAreAdminUsersLoaded)
      .pipe(take(1))
      .subscribe((loaded) => {
        if (!loaded) {
          this.store.dispatch(UsersActions.load());
        }
      });

    this.subscription.add(
      this.store.select(selectAdminUserById(userId)).subscribe((user) => {
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
