import { CommonModule } from "@angular/common";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";

import { NgbDateCustomParserFormatter } from "../shared/services/date-formatter.service";
import { CustomDatepickerI18n } from "../shared/services/date-french.service";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { UsagerSharedModule } from "../usager-shared/usager-shared.module";
import { StepDecisionComponent } from "./components/step-decision/step-decision.component";
import { StepDocumentsComponent } from "./components/step-documents/step-documents.component";
import { StepEntretienComponent } from "./components/step-entretien/step-entretien.component";
import { StepEtatCivilComponent } from "./components/step-etat-civil/step-etat-civil.component";
import { StepRdvComponent } from "./components/step-rdv/step-rdv.component";
import { UsagerDossierRoutingModule } from "./usager-dossier-routing.module";
import { StepFooterComponent } from "./components/step-footer/step-footer.component";
import { StepHeaderComponent } from "./components/step-header/step-header.component";
import { DecisionRefusFormComponent } from "./components/decision-refus-form/decision-refus-form.component";
import { DecisionValideFormComponent } from "./components/decision-valide-form/decision-valide-form.component";
import { UsagerNotesModule } from "../usager-notes/usager-notes.module";
import { BaseUsagerDossierPageComponent } from "./components/base-usager-dossier-page/base-usager-dossier-page.component";
import { FormatInternationalPhoneNumberPipe } from "../../shared/phone/formatInternationalPhoneNumber.pipe";
import { DecisionStandbyFormComponent } from "./components/decision-standby-form/decision-standby-form.component";
import { FullNamePipe } from "../usager-shared/pipes";
import { FormStepperComponent } from "./components/form-stepper/form-stepper.component";
import { DsfrDatePickerComponent } from "@edugouvfr/ngx-dsfr-ext";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";
import { PhoneInputComponent } from "../usager-shared/components/input-phone-international/input-phone-international.component";

@NgModule({
  declarations: [
    StepDecisionComponent,
    StepRdvComponent,
    StepEntretienComponent,
    StepDocumentsComponent,
    StepEtatCivilComponent,
    StepFooterComponent,
    StepHeaderComponent,
    // Sous-composants pour les décisions
    DecisionValideFormComponent,
    DecisionRefusFormComponent,
    BaseUsagerDossierPageComponent,
    DecisionStandbyFormComponent,
    FormStepperComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    UsagerSharedModule,
    FormsModule,
    SharedModule,
    NgbModule,
    ReactiveFormsModule,
    UsagerDossierRoutingModule,
    UsersModule,
    NgxIntlTelInputModule,
    UsagerNotesModule,
    FormatInternationalPhoneNumberPipe,
    FullNamePipe,
    DsfrDatePickerComponent,
    DsfrModalComponent,
    PhoneInputComponent,
  ],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class UsagerDossierModule {}
