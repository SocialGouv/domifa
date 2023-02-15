import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";

import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { DeleteUsagerMenuComponent } from "./components/delete-usager-menu/delete-usager-menu.component";
import { DisplayEntretienComponent } from "./components/display-entretien/display-entretien.component";
import { EntretienFormComponent } from "./components/entretien-form/entretien-form.component";
import { SetInteractionInFormComponent } from "./components/interactions/set-interaction-in-form/set-interaction-in-form.component";
import { SetInteractionOutFormComponent } from "./components/interactions/set-interaction-out-form/set-interaction-out-form.component";
import { RgpdWarningComponent } from "./components/rgpd-warning/rgpd-warning.component";
import { UploadComponent } from "./components/upload/upload.component";
import { ProfilEtatCivilFormComponent } from "./components/profil-etat-civil-form/profil-etat-civil-form.component";
import { ProfilGeneralNotesComponent } from "./components/profil-general-notes/profil-general-notes.component";
import { ProfilAddNoteFormComponent } from "./components/profil-add-note-form/profil-add-note-form.component";
import { DisplayUsagerDocsComponent } from "./components/display-usager-docs/display-usager-docs.component";
import { EtatCivilParentFormComponent } from "./components/etat-civil-parent-form/etat-civil-parent-form.component";
import { FormatInternationalPhoneNumberPipe } from "./formatInternationalPhoneNumber.pipe";
import { DisplayDuplicatesUsagerComponent } from "./components/display-duplicates-usager/display-duplicates-usager.component";

@NgModule({
  declarations: [
    DeleteUsagerMenuComponent,
    UploadComponent,
    RgpdWarningComponent,
    SetInteractionInFormComponent,
    EntretienFormComponent,
    SetInteractionOutFormComponent,
    DisplayEntretienComponent,
    ProfilEtatCivilFormComponent,
    ProfilGeneralNotesComponent,
    ProfilAddNoteFormComponent,
    DisplayUsagerDocsComponent,
    FormatInternationalPhoneNumberPipe,
    EtatCivilParentFormComponent,
    DisplayDuplicatesUsagerComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    RouterModule.forChild([]),
    UsersModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
  ],
  exports: [
    UploadComponent,
    RgpdWarningComponent,
    DisplayEntretienComponent,
    DeleteUsagerMenuComponent,
    SetInteractionInFormComponent,
    EntretienFormComponent,
    SetInteractionOutFormComponent,
    ProfilEtatCivilFormComponent,
    ProfilGeneralNotesComponent,
    ProfilAddNoteFormComponent,
    DisplayUsagerDocsComponent,
    FormatInternationalPhoneNumberPipe,
    DisplayDuplicatesUsagerComponent,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerSharedModule {}
