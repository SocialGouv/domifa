import { Subscription } from "rxjs";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { CountUpOptions } from "countup.js";
import { MatomoTracker } from "ngx-matomo-client";
import { HomeStats, UserStructure } from "../../../../../_common/model";

import { GeneralService } from "../../services/general.service";
import { AuthService } from "../../../shared/services";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, OnDestroy {
  public stats: HomeStats;
  private subscription = new Subscription();
  public countOptions: CountUpOptions;
  public me!: UserStructure | null;

  constructor(
    private readonly titleService: Title,
    private readonly generalService: GeneralService,
    private readonly authService: AuthService,
    public matomo: MatomoTracker
  ) {
    this.countOptions = {
      duration: 2,
      separator: " ",
    };

    this.stats = {
      structures: 0,
      usagers: 0,
      interactions: 0,
    };
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Domifa, faciliter la vie des organismes domiciliataires"
    );
    this.subscription.add(
      this.generalService.getHomeStats().subscribe((stats: HomeStats) => {
        this.stats = stats;
      })
    );
    this.me = this.authService.currentUserValue;
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
