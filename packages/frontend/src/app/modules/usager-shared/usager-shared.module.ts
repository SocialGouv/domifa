import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
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
import { DisplayUsagerDocsComponent } from "./components/display-usager-docs/display-usager-docs.component";
import { EtatCivilParentFormComponent } from "./components/etat-civil-parent-form/etat-civil-parent-form.component";
import { FormatInternationalPhoneNumberPipe } from "./formatInternationalPhoneNumber.pipe";
import { DisplayDuplicatesUsagerComponent } from "./components/display-duplicates-usager/display-duplicates-usager.component";
import { DecisionRadiationFormComponent } from "./components/decision-radiation-form/decision-radiation-form.component";
import { DeleteUsagerComponent } from "./components/delete-usager/delete-usager.component";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
} from "../shared/services";
import { DisplayAyantsDroitsComponent } from "./components/display-ayants-droits/display-ayants-droits.component";

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
    DisplayUsagerDocsComponent,
    FormatInternationalPhoneNumberPipe,
    EtatCivilParentFormComponent,
    DisplayDuplicatesUsagerComponent,
    DecisionRadiationFormComponent,
    DeleteUsagerComponent,
    DisplayAyantsDroitsComponent,
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
    DisplayAyantsDroitsComponent,
    UploadComponent,
    RgpdWarningComponent,
    DisplayEntretienComponent,
    DeleteUsagerMenuComponent,
    SetInteractionInFormComponent,
    EntretienFormComponent,
    SetInteractionOutFormComponent,
    ProfilEtatCivilFormComponent,
    DisplayUsagerDocsComponent,
    FormatInternationalPhoneNumberPipe,
    DisplayDuplicatesUsagerComponent,
    DeleteUsagerComponent,
    DecisionRadiationFormComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class UsagerSharedModule {}
