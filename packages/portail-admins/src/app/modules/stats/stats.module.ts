import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NationalStatsComponent } from "./components/national-stats/national-stats.component";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../shared/pipes/sort-array.pipe";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [NationalStatsComponent],
  imports: [
    CommonModule,
    SharedModule,
    FontAwesomeModule,
    FormsModule,
    TableHeadSortComponent,
    SortArrayPipe,
  ],
})
export class StatsModule {}
