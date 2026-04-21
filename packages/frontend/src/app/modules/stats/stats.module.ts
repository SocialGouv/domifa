import { ImpactComponent } from "./components/impact/impact.component";
import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModule } from "../shared/shared.module";

import { PublicStatsComponent } from "./components/public-stats/public-stats.component";
import { StatsRoutingModule } from "./stats-routing.module";
import { StatsChartsComponent } from "./components/elements/stats-charts/stats-charts.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { StatsMapComponent } from "./components/elements/stats-map/stats-map.component";
import { CountUpModule } from "ngx-countup";
import { FormatBigNumberPipe } from "./pipes";

@NgModule({
  declarations: [
    PublicStatsComponent,
    StatsChartsComponent,
    StatsMapComponent,
    ImpactComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,

    NgxChartsModule,
    CountUpModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    StatsRoutingModule,
    FormatBigNumberPipe,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class StatsModule {}
