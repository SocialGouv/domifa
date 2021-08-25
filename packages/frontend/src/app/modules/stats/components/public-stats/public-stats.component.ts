import { PublicStats } from "./../../../../../_common/model/stats/PublicStats.type";
import { StatsService } from "./../../services/stats.service";
import { Component, OnInit } from "@angular/core";
import { STRUCTURE_TYPE_LABELS } from "../../../../../_common/model/usager/constants/STRUCTURE_TYPE_LABELS.const";
import {
  RegionsLabels,
  REGIONS_LABELS_MAP,
  REGIONS_SEO_URL_MAP,
} from "../../../../shared";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-public-stats",
  templateUrl: "./public-stats.component.html",
  styleUrls: ["./public-stats.component.css"],
})
export class PublicStatsComponent implements OnInit {
  public STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public stats: PublicStats;
  public regions: RegionsLabels;
  public regionsUrls: RegionsLabels;

  constructor(
    public statsService: StatsService,
    private route: ActivatedRoute,
    private router: Router,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.stats = null;
    this.regions = REGIONS_LABELS_MAP;
    this.regionsUrls = REGIONS_SEO_URL_MAP;
  }

  public ngOnInit(): void {
    if (this.route.snapshot.params.region) {
      const region = this.route.snapshot.params.region;

      // TODO: check region exist
      this.statsService
        .getPublicStats(region)
        .subscribe((stats: PublicStats) => {
          this.stats = stats;
        });
    } else {
      this.statsService.getPublicStats().subscribe((stats: PublicStats) => {
        this.stats = stats;
      });
    }
  }
}
