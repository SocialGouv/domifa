import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../shared/shared.module";

import { StatsService } from "./services/stats.service";
import { StatsComponent } from "./components/structure-stats/structure-stats.component";
import { PublicStatsComponent } from "./components/public-stats/public-stats.component";
import { StatsRoutingModule } from "./stats-routing.module";
import { StatsChartsComponent } from "./components/elements/stats-charts/stats-charts.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { StatsMapComponent } from "./components/elements/stats-map/stats-map.component";
import { UsersModule } from "../users/users.module";

@NgModule({
  declarations: [
    StatsComponent,
    PublicStatsComponent,
    StatsChartsComponent,
    StatsMapComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    NgxChartsModule,
    SharedModule,
    FontAwesomeModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    UsersModule,
    StatsRoutingModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class StatsModule {}
