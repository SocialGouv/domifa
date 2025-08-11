import { Component, OnInit } from "@angular/core";
import { PublicStats } from "@domifa/common";
import { CountUpOptions } from "countup.js";
import { StatsService } from "../../services/stats.service";
import { Subscription } from "rxjs";
import {} from "@angular/common/http";
import { CountUpModule } from "ngx-countup";
import { NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-home-stats",
  templateUrl: "./home-stats.component.html",
  standalone: true,
  imports: [NgIf, CountUpModule, RouterLink],
  styleUrls: ["./home-stats.component.css"],
})
export class HomeStatsComponent implements OnInit {
  private readonly subscription = new Subscription();

  public stats: PublicStats;
  public countOptions: CountUpOptions;

  constructor(private readonly statsService: StatsService) {
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
