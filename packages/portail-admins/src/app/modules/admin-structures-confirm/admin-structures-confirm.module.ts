import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { AdminStructuresConfirmRoutingModule } from "./admin-structures-confirm-routing.module";
import { StructuresConfirmComponent } from "./structures-confirm.component";

@NgModule({
  declarations: [StructuresConfirmComponent],
  imports: [
    CommonModule,
    NgbModule,
    AdminStructuresConfirmRoutingModule,
    SharedModule,
    FontAwesomeModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminStructuresConfirmModule {}
