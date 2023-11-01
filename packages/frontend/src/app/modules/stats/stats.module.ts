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

import { StatsComponent } from "./components/structure-stats/structure-stats.component";
import { PublicStatsComponent } from "./components/public-stats/public-stats.component";
import { StatsRoutingModule } from "./stats-routing.module";
import { StatsChartsComponent } from "./components/elements/stats-charts/stats-charts.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { StatsMapComponent } from "./components/elements/stats-map/stats-map.component";
import { ImpactLineComponent } from "./components/elements/impact-line/impact-line.component";
import { CountUpModule } from "ngx-countup";

@NgModule({
  declarations: [
    StatsComponent,
    PublicStatsComponent,
    StatsChartsComponent,
    StatsMapComponent,
    ImpactLineComponent,
    ImpactComponent,
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class StatsModule {}
