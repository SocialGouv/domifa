import { ImpactComponent } from "./components/impact/impact.component";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../shared/shared.module";

import { PublicStatsComponent } from "./components/public-stats/public-stats.component";
import { StatsRoutingModule } from "./stats-routing.module";
import { StatsChartsComponent } from "./components/elements/stats-charts/stats-charts.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { StatsMapComponent } from "./components/elements/stats-map/stats-map.component";
import { ImpactLineComponent } from "./components/elements/impact-line/impact-line.component";
import { CountUpModule } from "ngx-countup";
import { HomeStatsComponent } from "./components/home-stats/home-stats.component";

@NgModule({
  declarations: [
    PublicStatsComponent,
    StatsChartsComponent,
    StatsMapComponent,
    ImpactLineComponent,
    ImpactComponent,
    HomeStatsComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    NgxChartsModule,
    CountUpModule,
    SharedModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    StatsRoutingModule,
  ],
  exports: [HomeStatsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class StatsModule {}
