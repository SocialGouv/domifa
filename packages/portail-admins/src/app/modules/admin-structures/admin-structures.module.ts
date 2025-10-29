import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "src/app/modules/shared/shared.module";
import { AdminStructuresRoutingModule } from "./admin-structures-routing.module";

import { AdminStructuresListComponent } from "./components/admin-structures-list/admin-structures-list.component";
import { StatsService } from "../stats/services/stats.service";
import { AdminStructuresTableComponent } from "./components/admin-structures-table/admin-structures-table.component";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../shared/pipes/sort-array.pipe";
import { StructureFiltersComponent } from "./components/structure-filters/structure-filters.component";
import { StructureConfirmComponent } from "./components/structure-confirm/structure-confirm.component";

import { DsfrDropdownMenuComponent } from "@edugouvfr/ngx-dsfr-ext";
import { DsfrButtonComponent, DsfrModalModule } from "@edugouvfr/ngx-dsfr";
import { StructureFormDeleteComponent } from "./components/structure-form-delete/structure-form-delete.component";
import { StructureFormRefuseComponent } from "./components/structure-form-refuse/structure-form-refuse.component";

@NgModule({
  declarations: [
    AdminStructuresListComponent,
    AdminStructuresTableComponent,
    StructureFiltersComponent,
    StructureConfirmComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    AdminStructuresRoutingModule,
    SharedModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    TableHeadSortComponent,
    SortArrayPipe,
    DsfrModalModule,
    DsfrDropdownMenuComponent,
    DsfrButtonComponent,
    StructureFormRefuseComponent,
    StructureFormDeleteComponent,
  ],
  providers: [StatsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminStructuresModule {}
