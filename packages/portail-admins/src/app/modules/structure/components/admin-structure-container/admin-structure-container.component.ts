import { Component, OnDestroy, OnInit } from "@angular/core";
import { ViewportScroller } from "@angular/common";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  UrlSegment,
} from "@angular/router";
import { Store } from "@ngrx/store";
import { filter, Subscription, take } from "rxjs";

import { StructureAdmin } from "@domifa/common";

import {
  selectAreStructuresLoaded,
  selectStructureById,
  StructuresActions,
} from "../../../shared/store/structures";

@Component({
  selector: "app-admin-structure-container",
  templateUrl: "./admin-structure-container.component.html",
  styleUrl: "./admin-structure-container.component.css",
  standalone: false,
})
export class AdminStructureContainerComponent implements OnInit, OnDestroy {
  public structure?: StructureAdmin;
  public currentUrl: UrlSegment[];
  public activeTab: "users" | "stats" | "infos";
  public loading = true;
  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store,
    private viewportScroller: ViewportScroller
  ) {
    this.subscription.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          const url = this.router.url;
          if (url.endsWith("/users")) {
            this.activeTab = "users";
          } else if (url.endsWith("/stats")) {
            this.activeTab = "stats";
          } else {
            this.activeTab = "infos";
          }
          this.viewportScroller.scrollToAnchor("subnav");
        })
    );
  }

  ngOnInit(): void {
    const structureId = parseInt(
      this.activatedRoute.snapshot.params["structureId"],
      10
    );

    this.store
      .select(selectAreStructuresLoaded)
      .pipe(take(1))
      .subscribe((loaded) => {
        if (!loaded) {
          this.store.dispatch(StructuresActions.load());
        }
      });

    this.subscription.add(
      this.store.select(selectStructureById(structureId)).subscribe({
        next: (structure) => {
          this.structure = structure;
          this.loading = false;

          if (!structure) {
            this.store
              .select(selectAreStructuresLoaded)
              .pipe(take(1))
              .subscribe((loaded) => {
                if (loaded) {
                  this.router.navigate(["/404"]);
                }
              });
          }
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
