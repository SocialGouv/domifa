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
import { DocumentsComponent } from "./components/documents/documents.component";
import { EntretienComponent } from "../usager-profil/components/profil-entretien-form/entretien.component";
import { DecisionComponent } from "./components/form/parts/decision/decision.component";
import { DocumentsFormComponent } from "./components/form/parts/documents-form/documents-form.component";
import { EntretienFormComponent } from "./components/form/parts/entretien-form/entretien-form.component";
import { MenuComponent } from "./components/form/parts/menu/menu.component";
import { RdvComponent } from "./components/form/parts/rdv/rdv.component";
import { UsagersFormComponent } from "./components/form/usagers-form";
import { ImportComponent } from "./components/import/import.component";
import { ManageUsagersTableComponent } from "./components/manage/manage-usagers-table/manage-usagers-table.component";

import { ManageUsagersComponent } from "./components/manage/manage.component";
import { ProfilHistoriqueSmsComponent } from "./components/profil-historique-sms/profil-historique-sms.component";

import { RaftComponent } from "./components/raft/raft.component";
import { UploadComponent } from "./components/upload/upload.component";
import { DocumentService } from "./services/document.service";
import { InteractionService } from "./services/interaction.service";
import { UsagerService } from "./services/usager.service";
import { SetInteractionInFormComponent } from "./components/interactions/set-interaction-in-form/set-interaction-in-form.component";
import { SetInteractionOutFormComponent } from "./components/interactions/set-interaction-out-form/set-interaction-out-form.component";
import { DeleteUsagerMenuComponent } from "./components/delete-usager-menu/delete-usager-menu.component";
import { UsagerProfilModule } from "../usager-profil/usager-profil.module";

@NgModule({
  declarations: [
    UploadComponent,
    DecisionComponent,
    RdvComponent,
    EntretienFormComponent,
    DocumentsFormComponent,
    UsagersFormComponent,
    DocumentsComponent,
    ManageUsagersComponent,
    ManageUsagersTableComponent,
    MenuComponent,
    DeleteUsagerMenuComponent,
    // UsagersProfilComponent,
    ImportComponent,
    RaftComponent,
    EntretienComponent,
    SetInteractionInFormComponent,
    SetInteractionOutFormComponent,
    ProfilHistoriqueSmsComponent,
  ],
  exports: [
    UploadComponent,
    DecisionComponent,
    UsagersFormComponent,
    EntretienComponent,
    DocumentsFormComponent,
    ManageUsagersComponent,

    ImportComponent,
    RaftComponent,
    DeleteUsagerMenuComponent,
    SetInteractionInFormComponent,
    SetInteractionOutFormComponent,
  ],
  imports: [
    CommonModule,
    GeneralModule,
    UsagerProfilModule,
    UsersModule,
    SharedModule,
    FontAwesomeModule,
    RouterModule.forRoot([], { relativeLinkResolution: "legacy" }),
    ToastrModule.forRoot({}),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    DocumentService,
    UsagerService,
    InteractionService,
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagersModule {}
