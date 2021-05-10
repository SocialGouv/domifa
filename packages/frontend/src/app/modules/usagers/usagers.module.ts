import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
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
import { EntretienComponent } from "./components/entretien/entretien.component";
import { DecisionComponent } from "./components/form/parts/decision/decision.component";
import { DeleteMenuComponent } from "./components/form/parts/delete-menu/delete-menu.component";
import { DocumentsFormComponent } from "./components/form/parts/documents-form/documents-form.component";
import { EntretienFormComponent } from "./components/form/parts/entretien-form/entretien-form.component";
import { MenuComponent } from "./components/form/parts/menu/menu.component";
import { RdvComponent } from "./components/form/parts/rdv/rdv.component";
import { UsagersFormComponent } from "./components/form/usagers-form";
import { ImportComponent } from "./components/import/import.component";
import { ManageUsagersComponent } from "./components/manage/manage.component";
import { ProfilAyantsDroitsComponent } from "./components/profil/profil-ayants-droits/profil-ayants-droits.component";
import { UsagersProfilComponent } from "./components/profil/profil-component";
import { ProfilEntretienComponent } from "./components/profil/profil-entretien/profil-entretien.component";
import { ProfilInfosComponent } from "./components/profil/profil-infos/profil-infos.component";
import { UsagersProfilProcurationCourrierComponent } from "./components/profil/profil-procuration-courrier/profil-procuration-courrier-component";
import { ProfilStructureDocsComponent } from "./components/profil/profil-structure-documents/profil-structure-docs.component.ts";
import { UsagersProfilTransfertCourrierComponent } from "./components/profil/profil-transfert-courrier/profil-transfert-courrier-component";
import { RaftComponent } from "./components/raft/raft.component";
import { UploadComponent } from "./components/upload/upload.component";
import { DocumentService } from "./services/document.service";
import { InteractionService } from "./services/interaction.service";
import { UsagerService } from "./services/usager.service";
import { ProfilEditPreferenceComponent } from "./components/profil/profil-edit-preference/profil-edit-preference.component";

import { SetInteractionInFormComponent } from "./components/interactions/set-interaction-in-form/set-interaction-in-form.component";
import { SetInteractionOutFormComponent } from "./components/interactions/set-interaction-out-form/set-interaction-out-form.component";

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
    MenuComponent,
    DeleteMenuComponent,
    ProfilStructureDocsComponent,
    UsagersProfilComponent,
    UsagersProfilTransfertCourrierComponent,
    UsagersProfilProcurationCourrierComponent,
    ProfilInfosComponent,
    ProfilAyantsDroitsComponent,
    ProfilEntretienComponent,
    ImportComponent,
    RaftComponent,
    EntretienComponent,
    ProfilEditPreferenceComponent,
    SetInteractionInFormComponent,
    SetInteractionOutFormComponent,
  ],
  exports: [
    UploadComponent,
    DecisionComponent,
    UsagersFormComponent,
    EntretienComponent,
    DocumentsFormComponent,
    ManageUsagersComponent,
    UsagersProfilComponent,
    ImportComponent,
    RaftComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    GeneralModule,
    UsersModule,
    SharedModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    ToastrModule.forRoot({
      enableHtml: true,
      positionClass: "toast-top-full-width",
      preventDuplicates: true,
      progressAnimation: "increasing",
      progressBar: true,
      timeOut: 2000,
    }),
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
