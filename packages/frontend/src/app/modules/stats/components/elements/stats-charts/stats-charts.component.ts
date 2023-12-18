import { Component, Input, OnChanges } from "@angular/core";
import { Color, ScaleType } from "@swimlane/ngx-charts";
import { fadeInOut } from "../../../../../shared";
import { PublicStats, StatsByMonth } from "@domifa/common";

@Component({
  animations: [fadeInOut],
  selector: "app-stats-charts",
  templateUrl: "./stats-charts.component.html",
  styleUrls: ["./stats-charts.component.css"],
})
export class StatsChartsComponent implements OnChanges {
  public view: number[] = [700, 400];

  public gradient = false;

  // options for the chart
  public showXAxis = true;
  public showYAxis = true;

  public showLegend = false;
  public barPadding = 35;
  public colorScheme: Color = {
    name: "ocean",
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ["#4164f5"],
  };
  public xAxisLabel = "";
  public showYAxisLabel = true;
  public showXAxisLabel = true;
  public yAxisLabel = "";
  public showLabels = true;

  public statsInCharts!: StatsByMonth;
  public selectedCharts: "courriers" | "usagers" = "courriers";

  @Input() public publicStats!: PublicStats;

  public ngOnChanges(): void {
    if (this.publicStats) {
      this.statsInCharts = this.publicStats.interactionsCountByMonth;
    }
  }

  public selectChart(value: "courriers" | "usagers"): void {
    this.selectedCharts = value;
    this.statsInCharts =
      value === "usagers"
        ? this.publicStats.usagersCountByMonth
        : this.publicStats.interactionsCountByMonth;
  }
}
