import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { GeneralModule } from "../general/general.module";
import { CustomDatepickerI18n } from "../shared/services/date-french";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { UsagerSharedModule } from "./../usager-shared/usager-shared.module";
import { DecisionComponent } from "./components/form/parts/decision/decision.component";
import { DocumentsFormComponent } from "./components/form/parts/documents-form/documents-form.component";
import { EntretienFormComponent } from "./components/form/parts/entretien-form/entretien-form.component";
import { MenuComponent } from "./components/form/parts/menu/menu.component";
import { RdvComponent } from "./components/form/parts/rdv/rdv.component";
import { UsagersFormComponent } from "./components/form/usagers-form";
import { ImportComponent } from "./components/import/import.component";
import { ManageUsagersTableComponent } from "./components/manage/manage-usagers-table/manage-usagers-table.component";
import { ManageUsagersComponent } from "./components/manage/manage.component";
import { RaftComponent } from "./components/raft/raft.component";
import { UsagerService } from "./services/usager.service";

@NgModule({
  declarations: [
    DecisionComponent,
    RdvComponent,
    EntretienFormComponent,
    DocumentsFormComponent,
    UsagersFormComponent,
    ManageUsagersComponent,
    ManageUsagersTableComponent,
    MenuComponent,
    ImportComponent,
    RaftComponent,
  ],
  exports: [DecisionComponent, UsagersFormComponent, DocumentsFormComponent],
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    GeneralModule,
    UsagerSharedModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    RouterModule.forChild([]),
    SharedModule,
    ToastrModule.forRoot({}),
    UsersModule,
  ],
  providers: [
    UsagerService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagersModule {}
