import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NationalStatsComponent } from "./components/national-stats/national-stats.component";
import { FormsModule } from "@angular/forms";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../shared/pipes/sort-array.pipe";
import { SharedModule } from "../shared/shared.module";
import { StatsRoutingModule } from "./stats-routing.module";
import { DsfrSpinnerComponent } from "@edugouvfr/ngx-dsfr-ext";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    StatsRoutingModule,
    TableHeadSortComponent,
    SortArrayPipe,
    DsfrSpinnerComponent,
    NationalStatsComponent,
  ],
})
export class StatsModule {}
