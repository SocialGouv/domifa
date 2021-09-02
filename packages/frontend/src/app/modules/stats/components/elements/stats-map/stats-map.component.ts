import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import {
  PublicStats,
  StatsByRegion,
  STATS_REGIONS_FOR_MAP,
} from "../../../../../../_common/model";
import { fadeInOut } from "../../../../../shared/animations";
import {
  RegionsLabels,
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

  public hoverToDisplay: string;
  @Input() public publicStats: PublicStats;

  public statsByRegion: StatsByRegion;

  constructor() {
    this.hoverToDisplay = null;
  }

  ngOnInit(): void {}

  public selectRegion(regionId: string) {
    this.hoverToDisplay = regionId;
  }

  public ngAfterViewInit(): void {
    this.statsByRegion = this.publicStats.structuresCountByRegion;
  }
}
