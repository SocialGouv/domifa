import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { GeneralModule } from "../general/general.module";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { DeleteUsagerMenuComponent } from "./components/delete-usager-menu/delete-usager-menu.component";
import { DisplayEntretienComponent } from "./components/display-entretien/display-entretien.component";
import { DisplayEtatCivilComponent } from "./components/display-etat-civil/display-etat-civil.component";
import { DocumentsComponent } from "./components/documents/documents.component";
import { EntretienComponent } from "./components/entretien-form/entretien.component";
import { SetInteractionInFormComponent } from "./components/interactions/set-interaction-in-form/set-interaction-in-form.component";
import { SetInteractionOutFormComponent } from "./components/interactions/set-interaction-out-form/set-interaction-out-form.component";
import { RgpdWarningComponent } from "./components/rgpd-warning/rgpd-warning.component";
import { UploadComponent } from "./components/upload/upload.component";
import { ProfilEtatCivilFormComponent } from "./components/profil-etat-civil-form/profil-etat-civil-form.component";
import { ProfilGeneralNotesComponent } from "./components/profil-general-notes/profil-general-notes.component";
import { ProfilAddNoteFormComponent } from "./components/profil-add-note-form/profil-add-note-form.component";

@NgModule({
  declarations: [
    DocumentsComponent,
    DeleteUsagerMenuComponent,
    UploadComponent,
    RgpdWarningComponent,
    SetInteractionInFormComponent,
    EntretienComponent,
    SetInteractionOutFormComponent,
    DisplayEtatCivilComponent,
    DisplayEntretienComponent,
    ProfilEtatCivilFormComponent,
    ProfilGeneralNotesComponent,
    ProfilAddNoteFormComponent,
  ],
  imports: [
    CommonModule,
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
    RgpdWarningComponent,
    DocumentsComponent,
    DisplayEntretienComponent,
    DeleteUsagerMenuComponent,
    DisplayEtatCivilComponent,
    SetInteractionInFormComponent,
    EntretienComponent,
    SetInteractionOutFormComponent,
    ProfilEtatCivilFormComponent,
    ProfilGeneralNotesComponent,
    ProfilAddNoteFormComponent,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerSharedModule {}
