import { Component, OnInit } from "@angular/core";
import { STATS_DOM_TOM, STATS_REGIONS_FOR_MAP } from "../../../types";

@Component({
  selector: "app-stats-map",
  templateUrl: "./stats-map.component.html",
  styleUrls: ["./stats-map.component.css"],
})
export class StatsMapComponent implements OnInit {
  public STATS_REGIONS_FOR_MAP = STATS_REGIONS_FOR_MAP;
  public STATS_REGIONS_DOM_TOM = STATS_DOM_TOM;

  constructor() {}

  ngOnInit(): void {}
  // Input avec les chiffres
  // TODO: HOVER DU PATH = COLOR NUMBER
}
