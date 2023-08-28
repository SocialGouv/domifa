import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "src/app/modules/shared/shared.module";
import { AdminStructuresRoutingModule } from "./admin-structures-routing.module";
import { AdminStructuresStatsComponent } from "./components";

import { AdminStructuresDocsComponent } from "./components/admin-structures-docs/admin-structures-docs.component";
import { AdminStructuresListComponent } from "./components/admin-structures-list/admin-structures-list.component";
import { AdminStructuresTableComponent } from "./components/admin-structures-list/admin-structures-table/admin-structures-table.component";

@NgModule({
  declarations: [
    AdminStructuresListComponent,
    AdminStructuresStatsComponent,
    AdminStructuresTableComponent,
    AdminStructuresDocsComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    AdminStructuresRoutingModule,
    SharedModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminStructuresModule {}
