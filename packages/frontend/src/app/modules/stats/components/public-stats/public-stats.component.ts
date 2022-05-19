import { SeoService } from "./../../../shared/services/seo.service";
import { PublicStats } from "./../../../../../_common/model/stats/PublicStats.type";
import { StatsService } from "./../../services/stats.service";
import { Component, OnInit } from "@angular/core";
import { STRUCTURE_TYPE_LABELS } from "../../../../../_common/model/structure/_constants/STRUCTURE_TYPE_LABELS.const";
import {
  DEPARTEMENTS_METROPOLE,
  RegionsLabels,
  REGIONS_ID_SEO,
  REGIONS_LISTE,
  REGIONS_SEO_ID,
  REGIONS_OUTRE_MER,
} from "../../../../shared";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-public-stats",
  templateUrl: "./public-stats.component.html",
  styleUrls: ["./public-stats.component.css"],
})
export class PublicStatsComponent implements OnInit {
  public STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public stats!: PublicStats;

  public regionId: string | null;

  public regions: RegionsLabels = REGIONS_LISTE;

  public DEPARTEMENTS_METROPOLE = DEPARTEMENTS_METROPOLE;
  public REGIONS_OUTRE_MER = REGIONS_OUTRE_MER;
  public REGIONS_SEO_ID: RegionsLabels = REGIONS_SEO_ID;
  public REGIONS_ID_SEO: RegionsLabels = REGIONS_ID_SEO;

  constructor(
    private statsService: StatsService,
    private route: ActivatedRoute,
    private router: Router,
    private seoService: SeoService
  ) {
    this.regionId = null;
  }

  public ngOnInit(): void {
    if (this.route.snapshot.params.region) {
      const region = this.route.snapshot.params.region as string;

      if (typeof REGIONS_SEO_ID[region] === "undefined") {
        this.router.navigate(["404"]);
        return;
      }

      this.regionId = region;

      this.statsService
        .getPublicStats(REGIONS_SEO_ID[region])
        .subscribe((stats: PublicStats) => {
          this.stats = stats;
        });

      const title =
        "Statistiques régionales : " + this.regions[REGIONS_SEO_ID[region]];
      const description =
        " Domifa simplifie la domiciliation et la distribution de courrier pour les personnes sans domicile stable dans la région" +
        this.regions[REGIONS_SEO_ID[region]];

      this.seoService.updateTitleAndTags(title, description, true);
    } else {
      this.statsService.getPublicStats().subscribe((stats: PublicStats) => {
        this.stats = stats;
      });
    }
  }
}
