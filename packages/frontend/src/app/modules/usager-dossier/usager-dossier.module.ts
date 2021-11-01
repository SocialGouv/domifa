import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { GeneralModule } from "../general/general.module";
import { NgbDateCustomParserFormatter } from "../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../shared/services/date-french";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { UsagerSharedModule } from "./../usager-shared/usager-shared.module";
import { DisplayEtatCivilDecisionComponent } from "./components/display-etat-civil-decision/display-etat-civil-decision.component";
import { MenuComponent } from "./components/menu/menu.component";
import { StepDecisionComponent } from "./components/step-decision/step-decision.component";
import { StepDocumentsComponent } from "./components/step-documents/step-documents.component";
import { StepEntretienComponent } from "./components/step-entretien/step-entretien.component";
import { StepEtatCivilComponent } from "./components/step-etat-civil/step-etat-civil.component";
import { StepRdvComponent } from "./components/step-rdv/step-rdv.component";
import { UsagerDossierRoutingModule } from "./usager-dossier-routing.module";
import { StepFooterComponent } from "./components/step-footer/step-footer.component";
import { StepHeaderComponent } from "./components/step-header/step-header.component";

@NgModule({
  declarations: [
    StepDecisionComponent,
    StepRdvComponent,
    StepEntretienComponent,
    StepDocumentsComponent,
    StepEtatCivilComponent,
    MenuComponent,
    DisplayEtatCivilDecisionComponent,
    StepFooterComponent,
    StepHeaderComponent,
  ],
  imports: [
    CommonModule,
    UsagerSharedModule,
    FormsModule,
    GeneralModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    UsagerDossierRoutingModule,
    UsersModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class UsagerDossierModule {}
