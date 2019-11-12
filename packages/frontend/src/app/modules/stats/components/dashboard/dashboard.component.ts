import { Component, OnInit } from "@angular/core";
import { StatsService } from "../../stats.service";

@Component({
  selector: "app-dashboard",
  styleUrls: ["./dashboard.component.css"],
  templateUrl: "./dashboard.component.html"
})
export class DashboardComponent implements OnInit {
  public title: string;
  constructor(public statsService: StatsService) {}

  public ngOnInit() {
    this.title = "Statistiques";
  }
}
