import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StructureComponent } from "./components/structure/structure.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SharedModule } from "../shared/shared.module";
import { StructureRoutingModule } from "./structure-routing.module";
import { UsersComponent } from "./components/users/users.component";
import { SortArrayPipe } from "../shared/pipes/sort-array.pipe";
import { StructureInfoComponent } from "./components/structure-info/structure-info.component";
import { FormatInternationalPhoneNumberPipe } from "../../shared/utils/formatInternationalPhoneNumber.pipe";
import { StructureStatsComponent } from "./components/structure-stats/structure-stats.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    StructureComponent,
    UsersComponent,
    StructureInfoComponent,
    UsersComponent,
    StructureStatsComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    FormatInternationalPhoneNumberPipe,
    SharedModule,
    FontAwesomeModule,
    TableHeadSortComponent,
    StructureRoutingModule,
    SortArrayPipe,
  ],
})
export class StructureModule {}
