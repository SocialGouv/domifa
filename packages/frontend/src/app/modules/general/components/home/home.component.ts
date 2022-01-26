import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { CountUpOptions } from "countup.js";
import { MatomoTracker } from "ngx-matomo";
import { HomeStats } from "./HomeStats.type";

import { GeneralService } from "../../services/general.service";

@Component({
  selector: "app-home",
  styleUrls: ["./home.component.css"],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  public stats: HomeStats;

  public countOptions: CountUpOptions;

  constructor(
    private titleService: Title,
    private generalService: GeneralService,
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

    this.generalService.getHomeStats().subscribe((stats: HomeStats) => {
      this.stats = stats;
    });
  }
}
