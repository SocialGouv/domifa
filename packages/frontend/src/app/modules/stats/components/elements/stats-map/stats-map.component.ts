import { Component, Input } from "@angular/core";

import { fadeInOut } from "../../../../../shared";
import {
  PublicStats,
  REGIONS_COM,
  REGIONS_DOM_TOM,
  REGIONS_ID_SEO,
  REGIONS_LISTE,
  REGIONS_OUTRE_MER,
  RegionsLabels,
} from "@domifa/common";
import { STATS_REGIONS_FOR_MAP } from "../../../constants";

@Component({
  animations: [fadeInOut],
  selector: "app-stats-map",
  templateUrl: "./stats-map.component.html",
  styleUrls: [
    "./stats-map.component.css",
    "../../public-stats/public-stats.component.scss",
  ],
})
export class StatsMapComponent {
  // Liste des régions
  public readonly REGIONS_DOM_TOM = REGIONS_DOM_TOM;
  public readonly REGIONS_COM = REGIONS_COM;
  public readonly REGIONS_OUTRE_MER = REGIONS_OUTRE_MER;

  public readonly STATS_REGIONS_FOR_MAP = STATS_REGIONS_FOR_MAP;

  // Urls des régions
  public readonly REGIONS_ID_SEO: RegionsLabels = REGIONS_ID_SEO;

  // Labels des régions
  public readonly REGIONS_LABELS: RegionsLabels = REGIONS_LISTE;

  // Région choisie
  public selectedRegion: string | null;

  // Statistiques par region
  @Input() public statsRegionsValues: { [key: string]: number };

  @Input() public publicStats!: PublicStats;

  constructor() {
    this.statsRegionsValues = {};
    this.selectedRegion = null;
  }

  public selectRegion(regionId: string): void {
    if (this.selectedRegion !== regionId) {
      this.selectedRegion = regionId;
    }
  }
}
