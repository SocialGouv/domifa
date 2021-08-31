import { PublicStats } from "./../../../../../_common/model/stats/PublicStats.type";
import { StatsService } from "./../../services/stats.service";
import { Component, OnInit } from "@angular/core";
import { STRUCTURE_TYPE_LABELS } from "../../../../../_common/model/usager/constants/STRUCTURE_TYPE_LABELS.const";
import {
  RegionsLabels,
  REGIONS_LABELS_MAP,
  REGIONS_SEO_URL_MAP,
  REGIONS_SEO_URL_TO_REGION_ID_MAP,
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
  public regionId: string;

  constructor(
    public statsService: StatsService,
    private route: ActivatedRoute,
    private router: Router,

    private titleService: Title
  ) {
    this.stats = null;
    this.regions = REGIONS_LABELS_MAP;
    this.regionsUrls = REGIONS_SEO_URL_MAP;
    this.regionId = null;
  }

  public ngOnInit(): void {
    if (this.route.snapshot.params.region) {
      const region = this.route.snapshot.params.region as string;
      if (typeof REGIONS_SEO_URL_TO_REGION_ID_MAP[region] !== "undefined") {
        this.titleService.setTitle("Stats de la région XX");
        this.regionId = region;

        this.statsService
          .getPublicStats(REGIONS_SEO_URL_TO_REGION_ID_MAP[region])
          .subscribe((stats: PublicStats) => {
            this.stats = stats;
          });
      } else {
        this.router.navigate(["404"]);
      }
    } else {
      this.statsService.getPublicStats().subscribe((stats: PublicStats) => {
        this.stats = stats;
      });
    }
  }
}
