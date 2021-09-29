import { PublicStats } from "./../../../../../../_common/model/stats/PublicStats.type";
import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { StatsService } from "../../../services/stats.service";
import { StatsByMonth } from "../../../../../../_common/model";

@Component({
  selector: "app-stats-charts",
  templateUrl: "./stats-charts.component.html",
  styleUrls: ["./stats-charts.component.css"],
})
export class StatsChartsComponent implements OnInit, AfterViewInit {
  public view: number[] = [700, 400];

  public gradient = false;

  // options for the chart
  public showXAxis = true;
  public showYAxis = true;

  public showLegend = false;
  public barPadding = 35;
  public colorScheme = {
    domain: ["#4164f5"],
  };
  public xAxisLabel = "";
  public showYAxisLabel = true;
  public showXAxisLabel = true;
  public yAxisLabel = "";
  public showLabels = true;

  public statsInCharts: StatsByMonth;
  public selectedCharts: "courriers" | "usagers";

  @Input() public publicStats: PublicStats;

  constructor(public statsService: StatsService) {
    this.selectedCharts = "courriers";
  }

  public ngOnInit(): void {
    this.statsInCharts = this.publicStats.interactionsCountByMonth;
  }

  public ngAfterViewInit(): void {
    this.statsInCharts = this.publicStats.interactionsCountByMonth;
  }

  public selectChart(value: "courriers" | "usagers"): void {
    this.selectedCharts = value;
    this.statsInCharts =
      value === "usagers"
        ? this.publicStats.usagersCountByMonth
        : this.publicStats.interactionsCountByMonth;
  }
}
