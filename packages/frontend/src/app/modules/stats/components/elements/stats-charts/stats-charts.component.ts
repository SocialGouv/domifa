import { PublicStats } from "./../../../../../../_common/model/stats/PublicStats.type";
import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { StatsService } from "../../../services/stats.service";
import { DEFAULT_PUBLIC_STATS } from "../../../../../../_common/model/stats/DEFAULT_PUBLIC_STATS.const";

@Component({
  selector: "app-stats-charts",
  templateUrl: "./stats-charts.component.html",
  styleUrls: ["./stats-charts.component.css"],
})
export class StatsChartsComponent implements AfterViewInit {
  public multi: any[];

  public view: any[] = [700, 400];

  public gradient = false;

  // options for the chart
  public showXAxis: boolean = true;
  public showYAxis: boolean = true;

  public showLegend: boolean = false;
  public barPadding: number = 35;
  public colorScheme = {
    domain: ["#4164f5"],
  };
  public xAxisLabel = "";
  public showYAxisLabel = true;
  public showXAxisLabel = true;
  public yAxisLabel = "";
  public showLabels = true;

  public statsInCharts = [];
  public selectedCharts: "courriers" | "usagers";

  @Input() public publicStats: PublicStats;

  constructor(public statsService: StatsService) {
    this.publicStats = DEFAULT_PUBLIC_STATS;
    this.selectedCharts = "courriers";
  }

  public ngAfterViewInit(): void {
    this.statsInCharts = this.publicStats.interactionsCountByMonth;
  }

  public selectChart(value: "courriers" | "usagers") {
    this.selectedCharts = value;
    this.statsInCharts =
      value === "usagers"
        ? this.publicStats.usagersCountByMonth
        : this.publicStats.interactionsCountByMonth;
  }
}
