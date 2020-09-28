import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { GeneralModule } from "../general/general.module";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { DecisionComponent } from "./components/form/parts/decision/decision.component";
import { RdvComponent } from "./components/form/parts/rdv/rdv.component";

import { UploadComponent } from "./components/upload/upload.component";
import { UsagersFormComponent } from "./components/form/usagers-form";
import { ImportComponent } from "./components/import/import.component";
import { ManageUsagersComponent } from "./components/manage/manage.component";
import { UsagersProfilComponent } from "./components/profil/profil-component";
import { RaftComponent } from "./components/raft/raft.component";
import { DocumentService } from "./services/document.service";
import { InteractionService } from "./services/interaction.service";
import { UsagerService } from "./services/usager.service";
import { DocumentsComponent } from "./components/documents/documents.component";
import { MenuComponent } from "./components/form/parts/menu/menu.component";
import { EntretienComponent } from "./components/entretien/entretien.component";
import { EntretienFormComponent } from "./components/form/parts/entretien-form/entretien-form.component";
import { DocumentsFormComponent } from "./components/form/parts/documents-form/documents-form.component";
import { DeleteMenuComponent } from "./components/form/parts/delete-menu/delete-menu.component";

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
    UsagersProfilComponent,
    ImportComponent,
    RaftComponent,
    EntretienComponent,
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagersModule {}
