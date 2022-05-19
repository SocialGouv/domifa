import { AfterContentChecked, Component, Input, OnInit } from "@angular/core";
import {
  PublicStats,
  StatsByRegion,
  STATS_REGIONS_FOR_MAP,
} from "../../../../../../_common/model";

import {
  fadeInOut,
  RegionsLabels,
  REGIONS_DEF,
  REGIONS_ID_SEO,
  REGIONS_LISTE,
  REGIONS_COM,
  REGIONS_DOM_TOM,
  REGIONS_OUTRE_MER,
  DEPARTEMENTS_COM,
} from "../../../../../shared";

@Component({
  animations: [fadeInOut],
  selector: "app-stats-map",
  templateUrl: "./stats-map.component.html",
  styleUrls: [
    "./stats-map.component.css",
    "../../public-stats/public-stats.component.css",
  ],
})
export class StatsMapComponent implements OnInit, AfterContentChecked {
  // Liste des régions
  public REGIONS_DOM_TOM = REGIONS_DOM_TOM;
  public REGIONS_COM = REGIONS_COM;
  public REGIONS_OUTRE_MER = REGIONS_OUTRE_MER;
  public DEPARTEMENTS_COM = DEPARTEMENTS_COM;
  public STATS_REGIONS_FOR_MAP = STATS_REGIONS_FOR_MAP;

  // Urls des régions
  public REGIONS_ID_SEO: RegionsLabels = REGIONS_ID_SEO;

  // Labels des régions
  public REGIONS_LABELS: RegionsLabels = REGIONS_LISTE;

  // Région choisie
  public selectedRegion: string;

  // Statistiques par region
  public statsRegionsValues: { [key: string]: number };

  @Input() public publicStats!: PublicStats;

  public statsByRegion: StatsByRegion;

  constructor() {
    this.statsRegionsValues = null;
    this.selectedRegion = null;
  }

  public ngOnInit(): void {}

  public selectRegion(regionId: string): void {
    if (this.selectedRegion !== regionId) {
      this.selectedRegion = regionId;
    }
  }

  public ngAfterContentChecked(): void {
    this.statsByRegion = this.publicStats.structuresCountByRegion;

    this.statsRegionsValues = Object.values(REGIONS_DEF).reduce(
      (acc, value) => {
        acc[value.regionCode] = 0;
        return acc;
      },
      {}
    );

    this.publicStats.structuresCountByRegion.forEach((regionStat) => {
      this.statsRegionsValues[regionStat.region] = regionStat.count;
    });
  }
}
