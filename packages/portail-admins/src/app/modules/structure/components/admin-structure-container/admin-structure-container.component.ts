import { filter, Subscription } from "rxjs";
import { Component, OnInit } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  UrlSegment,
} from "@angular/router";
import { ViewportScroller } from "@angular/common";
import { appStore } from "../../../shared/store/appStore.service";
import { StructureAdmin } from "@domifa/common";

@Component({
  selector: "app-admin-structure-container",
  templateUrl: "./admin-structure-container.component.html",
  styleUrl: "./admin-structure-container.component.css",
})
export class AdminStructureContainerComponent implements OnInit {
  public structure?: StructureAdmin;
  public currentUrl: UrlSegment[];
  public activeTab: "users" | "stats" | "infos";
  private subscription: Subscription = new Subscription();
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
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
    this.subscription.add(
      this.activatedRoute.data.subscribe((data) => {
        this.structure = data.structure;

        if (!this.structure) {
          this.router.navigate(["/404"]);
        }
      })
    );

    this.subscription.add(
      appStore.subscribe(() => {
        const state = appStore.getState();
        const structures = state?.structureListData;

        if (structures) {
          this.structure = structures.find(
            (structure) => structure.id === this.structure?.id
          );
          if (!this.structure) {
            this.router.navigate(["/404"]);
          }
        }
      })
    );
  }
}
