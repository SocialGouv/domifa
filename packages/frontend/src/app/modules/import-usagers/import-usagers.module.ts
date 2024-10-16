import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImportComponent } from "./components/import/import.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "../shared/shared.module";
import { UsagerSharedModule } from "../usager-shared/usager-shared.module";
import { UsersModule } from "../users/users.module";
import { ImportUsagersRoutingModule } from "./import-usagers-routing.module";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [ImportComponent],
  imports: [
    CommonModule,
    FormsModule,
    UsagerSharedModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    UsersModule,
    ImportUsagersRoutingModule,
    FontAwesomeModule,
  ],
})
export class ImportUsagersModule {}
