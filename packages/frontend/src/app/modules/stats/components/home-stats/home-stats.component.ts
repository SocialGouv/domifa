import { Component, inject, OnInit } from "@angular/core";
import { PublicStats } from "@domifa/common";
import { CountUpOptions } from "countup.js";
import { StatsService } from "../../services/stats.service";
import { Subscription } from "rxjs";
import { CountUpDirective } from "ngx-countup";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-home-stats",
  templateUrl: "./home-stats.component.html",
  imports: [CountUpDirective, RouterLink],
  styleUrls: ["./home-stats.component.css"],
})
export class HomeStatsComponent implements OnInit {
  private readonly subscription = new Subscription();

  private readonly statsService = inject(StatsService);

  public stats: PublicStats;
  public countOptions: CountUpOptions;

  constructor() {
    this.countOptions = {
      duration: 2,
      separator: " ",
    };

    this.stats = new PublicStats();
  }

  ngOnInit() {
    this.subscription.add(
      this.statsService.getPublicStats().subscribe((stats: PublicStats) => {
        this.stats = stats;
      })
    );
  }
}
