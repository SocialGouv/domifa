import { DEFAULT_PUBLIC_STATS } from "./../../../../../_common/model/stats/DEFAULT_PUBLIC_STATS.const";
import { PublicStats } from "./../../../../../_common/model/stats/PublicStats.type";
import { StatsService } from "./../../services/stats.service";
import { Component, OnInit } from "@angular/core";
import { STRUCTURE_TYPE_LABELS } from "../../../../../_common/model/usager/constants/STRUCTURE_TYPE_LABELS.const";
import {
  DEPARTEMENTS_MAP,
  RegionsLabels,
  REGIONS_LABELS_MAP,
  REGIONS_SEO_URL_MAP,
  REGIONS_SEO_URL_TO_REGION_ID_MAP,
} from "../../../../shared";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-public-stats",
  templateUrl: "./public-stats.component.html",
  styleUrls: ["./public-stats.component.css"],
})
export class PublicStatsComponent implements OnInit {
  public STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public stats: PublicStats;

  public regionId: string;

  public regionsUrls: RegionsLabels = REGIONS_SEO_URL_MAP;
  public regions: RegionsLabels = REGIONS_LABELS_MAP;

  public departements: {
    [key: string]: {
      departmentName: string;
      regionCode: string;
      regionName: string;
      regionId: string;
    };
  } = DEPARTEMENTS_MAP;

  public REGIONS_SEO_URL_TO_REGION_ID_MAP: RegionsLabels =
    REGIONS_SEO_URL_TO_REGION_ID_MAP;

  public STATS_REGIONS_DOM_TOM = ["01", "02", "03", "04", "06"];

  constructor(
    private statsService: StatsService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) {
    this.regionId = null;
  }

  public ngOnInit(): void {
    if (this.route.snapshot.params.region) {
      const region = this.route.snapshot.params.region as string;

      if (typeof REGIONS_SEO_URL_TO_REGION_ID_MAP[region] !== "undefined") {
        this.titleService.setTitle("Stats régionnales");
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
