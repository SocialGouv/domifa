import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import {
  PublicStats,
  StatsByRegion,
  STATS_REGIONS_FOR_MAP,
} from "../../../../../../_common/model";
import { fadeInOut } from "../../../../../shared/animations";

@Component({
  animations: [fadeInOut],
  selector: "app-stats-map",
  templateUrl: "./stats-map.component.html",
  styleUrls: ["./stats-map.component.css"],
})
export class StatsMapComponent implements OnInit, AfterViewInit {
  public STATS_REGIONS_FOR_MAP = STATS_REGIONS_FOR_MAP;
  public STATS_REGIONS_DOM_TOM = ["01", "02", "03", "04", "06"];

  @Input() public publicStats: PublicStats;

  public statsByRegion: StatsByRegion;

  constructor() {
    this.statsByRegion = [];
  }

  ngOnInit(): void {}

  // TODO: HOVER DU PATH = COLOR NUMBER

  public ngAfterViewInit(): void {
    this.statsByRegion = this.publicStats.structuresCountByRegion;
  }
}
