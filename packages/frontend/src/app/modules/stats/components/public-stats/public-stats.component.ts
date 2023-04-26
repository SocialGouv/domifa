import { SeoService } from "./../../../shared/services/seo.service";
import { PublicStats } from "./../../../../../_common/model/stats/PublicStats.type";
import { StatsService } from "./../../services/stats.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { STRUCTURE_TYPE_LABELS } from "../../../../../_common/model/structure/_constants/STRUCTURE_TYPE_LABELS.const";
import {
  DEPARTEMENTS_METROPOLE,
  RegionsLabels,
  REGIONS_ID_SEO,
  REGIONS_LISTE,
  REGIONS_SEO_ID,
  REGIONS_OUTRE_MER,
  fadeInOut,
  DEPARTEMENTS_COM,
  RegionDef,
  REGIONS_DEF,
} from "../../../../shared";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { StatsByLocality } from "../../../../../_common/model";

@Component({
  animations: [fadeInOut],
  selector: "app-public-stats",
  templateUrl: "./public-stats.component.html",
  styleUrls: [
    "./public-stats.component.css",
    "../elements/stats-charts/stats-charts.component.css",
  ],
})
export class PublicStatsComponent implements OnInit, OnDestroy {
  public readonly STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public readonly regions: RegionsLabels = REGIONS_LISTE;
  public readonly DEPARTEMENTS_METROPOLE = DEPARTEMENTS_METROPOLE;
  public readonly REGIONS_OUTRE_MER = REGIONS_OUTRE_MER;
  public readonly REGIONS_SEO_ID: RegionsLabels = REGIONS_SEO_ID;
  public readonly REGIONS_ID_SEO: RegionsLabels = REGIONS_ID_SEO;
  public readonly DEPARTEMENTS_COM = DEPARTEMENTS_COM;

  public readonly countOptions = {
    duration: 2,
    separator: " ",
  };

  private subscription = new Subscription();
  public statsByRegion!: StatsByLocality;
  public statsRegionsValues: { [key: string]: number };
  public distributionRate: number;
  public stats!: PublicStats;
  public regionId: string | null;

  constructor(
    private readonly statsService: StatsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly seoService: SeoService
  ) {
    this.statsRegionsValues = {};
    this.regionId = null;
    this.distributionRate = 0;
  }

  public ngOnInit(): void {
    if (this.route.snapshot.params.region) {
      const region = this.route.snapshot.params.region as string;

      if (region && typeof REGIONS_SEO_ID[region] === "undefined") {
        this.router.navigate(["404"]);
        return;
      }

      this.regionId = region;

      this.subscription.add(
        this.statsService
          .getPublicStats(REGIONS_SEO_ID[region])
          .subscribe((stats: PublicStats) => {
            this.stats = stats;
            this.distributionRate = Math.ceil(
              (stats.courrierOutCount / stats.courrierInCount) * 100
            );
          })
      );

      const title =
        "Statistiques régionales : " + this.regions[REGIONS_SEO_ID[region]];
      const description =
        "DomiFa simplifie la domiciliation et la distribution de courrier pour les personnes sans domicile stable dans la région " +
        this.regions[REGIONS_SEO_ID[region]];

      this.seoService.updateTitleAndTags(title, description, true);
    } else {
      this.seoService.updateTitleAndTags(
        "Statistiques d'utilisation de DomiFa",
        "DomiFa simplifie la domiciliation partout en France, découvrez nos statistiques.",
        true
      );
      this.subscription.add(
        this.statsService.getPublicStats().subscribe((stats: PublicStats) => {
          this.stats = stats;
          this.distributionRate = Math.ceil(
            (stats.courrierOutCount / stats.courrierInCount) * 100
          );
          this.generateStatsByRegionForMap();
        })
      );
    }
  }

  public generateStatsByRegionForMap(): void {
    if (this.stats?.structuresCountByRegion) {
      this.statsByRegion = this.stats.structuresCountByRegion;

      this.statsRegionsValues = Object.values(REGIONS_DEF).reduce(
        (acc: { [key: string]: number }, value: RegionDef) => {
          acc[value.regionCode] = 0;
          return acc;
        },
        {}
      );

      this.stats.structuresCountByRegion.forEach((regionStat) => {
        this.statsRegionsValues[regionStat.region] = regionStat.count;
      });
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
