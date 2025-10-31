import { filter, Subscription } from "rxjs";
import { Component } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  UrlSegment,
} from "@angular/router";
import { StructureCommon } from "@domifa/common";
import { ViewportScroller } from "@angular/common";

@Component({
  selector: "app-admin-structure-container",
  templateUrl: "./admin-structure-container.component.html",
  styleUrl: "./admin-structure-container.component.css",
})
export class AdminStructureContainerComponent {
  public structure: StructureCommon;
  public currentUrl: UrlSegment[];
  public activeTab: "users" | "stats" | "infos";
  private subscription: Subscription = new Subscription();
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private viewportScroller: ViewportScroller
  ) {
    this.structure = this.activatedRoute.snapshot.data.structure;

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
}
