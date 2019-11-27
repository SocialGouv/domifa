import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPrintModule } from "ngx-print";
import { ToastrModule } from "ngx-toastr";
import { NgbDateCustomParserFormatter } from "src/app/services/date-formatter";
import { SharedModule } from "../shared/shared.module";
import { DecisionComponent } from "./components/decision/decision.component";
import { UsagersFormComponent } from "./components/form/usagers-form";
import { ImportComponent } from "./components/import/import.component";
import { ManageUsagersComponent } from "./components/manage/manage.component";
import { UsagersProfilComponent } from "./components/profil/profil-component";
import { RaftComponent } from "./components/raft/raft.component";
import { UploadComponent } from "./components/upload/upload.component";
import { DocumentService } from "./services/document.service";
import { InteractionService } from "./services/interaction.service";
import { UsagerService } from "./services/usager.service";

@NgModule({
  declarations: [
    UploadComponent,
    DecisionComponent,
    UsagersFormComponent,
    ManageUsagersComponent,
    UsagersProfilComponent,
    ImportComponent,
    RaftComponent
  ],
  exports: [
    UploadComponent,
    DecisionComponent,
    UsagersFormComponent,
    ManageUsagersComponent,
    UsagersProfilComponent,
    ImportComponent,
    RaftComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    NgxPrintModule,
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
      timeOut: 2000
    }),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    DocumentService,
    UsagerService,
    InteractionService,
    NgbDateCustomParserFormatter
  ]
})
export class UsagersModule {}
