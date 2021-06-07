import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DocumentsComponent } from "./components/documents/documents.component";
import { UploadComponent } from "./components/upload/upload.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";

import { DocumentService } from "./services/document.service";

import { DeleteUsagerMenuComponent } from "./components/delete-usager-menu/delete-usager-menu.component";
import { SetInteractionInFormComponent } from "./components/interactions/set-interaction-in-form/set-interaction-in-form.component";
import { SetInteractionOutFormComponent } from "./components/interactions/set-interaction-out-form/set-interaction-out-form.component";
import { EntretienComponent } from "./components/entretien-form/entretien.component";
import { DisplayEtatCivilComponent } from "./components/display-etat-civil/display-etat-civil.component";
import { DisplayEntretienComponent } from "./components/display-entretien/display-entretien.component";
import { UsersModule } from "../users/users.module";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { GeneralModule } from "../general/general.module";

@NgModule({
  declarations: [
    DocumentsComponent,
    DeleteUsagerMenuComponent,
    UploadComponent,
    SetInteractionInFormComponent,
    EntretienComponent,
    SetInteractionOutFormComponent,
    DisplayEtatCivilComponent,
    DisplayEntretienComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    GeneralModule,
    RouterModule.forChild([]),
    SharedModule,
    ToastrModule.forRoot({}),
    UsersModule,
    ReactiveFormsModule,
  ],
  exports: [
    UploadComponent,
    DocumentsComponent,
    DisplayEntretienComponent,
    DeleteUsagerMenuComponent,
    DisplayEtatCivilComponent,
    SetInteractionInFormComponent,
    EntretienComponent,
    SetInteractionOutFormComponent,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerSharedModule {}
