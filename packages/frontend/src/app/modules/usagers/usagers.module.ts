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
import { DateFrDirective } from "src/app/directives/date-fr.directive";
import { DigitOnlyDirective } from "src/app/directives/digit-only.directive";
import { DecisionComponent } from "./components/decision/decision.component";
import { UsagersFormComponent } from "./components/form/usagers-form";
import { ImportComponent } from "./components/import/import.component";
import { ManageUsagersComponent } from "./components/manage/manage.component";
import { UsagersProfilComponent } from "./components/profil/profil-component";
import { RaftComponent } from "./components/raft/raft.component";
import { UploadComponent } from "./components/upload/upload.component";

@NgModule({
  declarations: [
    UploadComponent,
    DecisionComponent,
    UsagersFormComponent,
    ManageUsagersComponent,
    UsagersProfilComponent,
    ImportComponent,
    DigitOnlyDirective,
    DateFrDirective,
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
    BrowserAnimationsModule,
    FontAwesomeModule,
    RouterModule.forRoot([]),
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UsagersModule {}
