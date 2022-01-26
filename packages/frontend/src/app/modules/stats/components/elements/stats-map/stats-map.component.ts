import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import {
  PublicStats,
  StatsByRegion,
  STATS_REGIONS_FOR_MAP,
} from "../../../../../../_common/model";
import { fadeInOut } from "../../../../../shared/animations";
import {
  RegionsLabels,
  REGIONS_DEF,
  REGIONS_LABELS_MAP,
  REGIONS_SEO_URL_MAP,
} from "../../../../../shared";

@Component({
  animations: [fadeInOut],
  selector: "app-stats-map",
  templateUrl: "./stats-map.component.html",
  styleUrls: ["./stats-map.component.css"],
})
export class StatsMapComponent implements OnInit, AfterViewInit {
  public STATS_REGIONS_DOM_TOM = ["01", "02", "03", "04", "06"];
  public STATS_REGIONS_FOR_MAP = STATS_REGIONS_FOR_MAP;
  public regions: RegionsLabels = REGIONS_LABELS_MAP;
  public regionsUrls: RegionsLabels = REGIONS_SEO_URL_MAP;

  public selectedRegion: string;

  public statsRegionsValues: { [key: string]: number };
  @Input() public publicStats: PublicStats;

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

  public ngAfterViewInit(): void {
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
