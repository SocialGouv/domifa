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
import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";

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
import { DisplayDuplicatesUsagerComponent } from "./components/display-duplicates-usager/display-duplicates-usager.component";
import { DecisionRadiationFormComponent } from "./components/decision-radiation-form/decision-radiation-form.component";
import { DeleteUsagerComponent } from "./components/delete-usager/delete-usager.component";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
} from "../shared/services";
import { DisplayAyantsDroitsComponent } from "./components/display-ayants-droits/display-ayants-droits.component";
import { FormContactDetailsComponent } from "./components/form-contact-details/form-contact-details.component";
import { InputNationalityComponent } from "./components/input-nationality/input-nationality.component";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../shared/pipes";
import { DisplayTableImageComponent } from "../shared/components/display-table-image/display-table-image.component";
import { FullNamePipe } from "./pipes";
import { EditUsagerDocComponent } from "./components/edit-usager-doc/edit-usager-doc.component";
import { ReferrerNamePipe } from "./pipes/referrer-name.pipe";

@NgModule({
  declarations: [
    DecisionRadiationFormComponent,
    DeleteUsagerComponent,
    DeleteUsagerMenuComponent,
    DisplayAyantsDroitsComponent,
    DisplayDuplicatesUsagerComponent,
    DisplayEntretienComponent,
    DisplayUsagerDocsComponent,
    EntretienFormComponent,
    EtatCivilParentFormComponent,
    FormContactDetailsComponent,
    InputNationalityComponent,
    ProfilEtatCivilFormComponent,
    RgpdWarningComponent,
    SetInteractionInFormComponent,
    SetInteractionOutFormComponent,
    UploadComponent,
    EditUsagerDocComponent,
    ReferrerNamePipe,
  ],
  imports: [
    CommonModule,
    DisplayTableImageComponent,
    FormsModule,
    HttpClientModule,
    NgbModule,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    RouterModule.forChild([]),
    SharedModule,
    SortArrayPipe,
    TableHeadSortComponent,
    FullNamePipe,
    UsersModule,
  ],
  exports: [
    DecisionRadiationFormComponent,
    ReferrerNamePipe,
    DeleteUsagerComponent,
    DeleteUsagerMenuComponent,
    DisplayAyantsDroitsComponent,
    DisplayDuplicatesUsagerComponent,
    DisplayEntretienComponent,
    DisplayUsagerDocsComponent,
    EntretienFormComponent,
    FormContactDetailsComponent,
    InputNationalityComponent,
    ProfilEtatCivilFormComponent,
    RgpdWarningComponent,
    SetInteractionInFormComponent,
    SetInteractionOutFormComponent,
    UploadComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class UsagerSharedModule {}
