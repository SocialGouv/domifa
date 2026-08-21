import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { SharedModule } from "../shared/shared.module";
import { StatsRoutingModule } from "./stats-routing.module";
import { NationalStatsComponent } from "./components/national-stats/national-stats.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    StatsRoutingModule,
    DsfrSpinnerComponent,
    NationalStatsComponent,
  ],
})
export class StatsModule {}
