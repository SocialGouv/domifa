import { UserStructure } from "@domifa/common";
import { Subscription } from "rxjs";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatomoTracker } from "ngx-matomo-client";

import { AuthService } from "../../../shared/services";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly subscription = new Subscription();
  public me!: UserStructure | null;

  constructor(
    private readonly titleService: Title,
    private readonly authService: AuthService,
    public matomo: MatomoTracker
  ) {}

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Domifa, faciliter la vie des organismes domiciliataires"
    );

    this.me = this.authService.currentUserValue;
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
