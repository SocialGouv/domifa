import { PublicStats } from "./../../../../../_common/model/stats/PublicStats.type";
import { StatsService } from "./../../services/stats.service";
import { Component, OnInit } from "@angular/core";
import { STRUCTURE_TYPE_LABELS } from "../../../../../_common/model/usager/constants/STRUCTURE_TYPE_LABELS.const";

@Component({
  selector: "app-public-stats",
  templateUrl: "./public-stats.component.html",
  styleUrls: ["./public-stats.component.css"],
})
export class PublicStatsComponent implements OnInit {
  public STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public stats: PublicStats;
  constructor(public statsService: StatsService) {
    this.stats = null;
  }

  public ngOnInit(): void {
    this.statsService.getPublicStats().subscribe((stats: PublicStats) => {
      this.stats = stats;
    });
  }
}
