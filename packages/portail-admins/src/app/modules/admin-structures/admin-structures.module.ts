import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { AdminStructuresRoutingModule } from "./admin-structures-routing.module";
import {
  AdminStructuresListComponent,
  AdminStructuresStatsComponent,
  AdminStructuresTableComponent,
} from "./components";

@NgModule({
  declarations: [
    AdminStructuresListComponent,
    AdminStructuresStatsComponent,
    AdminStructuresTableComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    AdminStructuresRoutingModule,
    SharedModule,
    FontAwesomeModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminStructuresModule {}
