import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerProfilRoutingModule } from "./usager-profil-routing.module";

import { ProfilCourriersComponent } from "./components/profil-courriers/profil-courriers.component";
import { ProfilOverviewComponent } from "./components/profil-overview/profil-overview.component";

import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "../shared/shared.module";
import { ProfilHeadComponent } from "./components/profil-head/profil-head.component";
import { ProfilDossierComponent } from "./components/profil-dossier/profil-dossier.component";
import { ProfilHistoriqueComponent } from "./components/profil-historique/profil-historique.component";
import { UsagersProfilTransfertCourrierComponent } from "./components/profil-transfert-courrier/profil-transfert-courrier-component";
import { NgbDateCustomParserFormatter } from "../shared/services/date-formatter";
import { CustomDatepickerI18n } from "../shared/services/date-french";
import { UsagersProfilProcurationCourrierComponent } from "./components/profil-procuration-courrier/profil-procuration-courrier-component";
import { ProfilHistoriqueCourriersComponent } from "./components/profil-historique-courriers/profil-historique-courriers.component";
import { ProfilEditPreferenceComponent } from "./components/profil-edit-preference/profil-edit-preference.component";
import { ProfilEntretienComponent } from "./components/profil-entretien/profil-entretien.component";
import { ProfilStructureDocsComponent } from "./components/profil-structure-documents/profil-structure-docs.component.ts";
import { ProfilEtatCivilComponent } from "./components/profil-etat-civil/profil-etat-civil.component";
import { ProfilEtatCivilFormComponent } from "./components/profil-etat-civil-form/profil-etat-civil-form.component";

@NgModule({
  declarations: [
    // Composants principaux
    ProfilOverviewComponent,
    ProfilCourriersComponent,
    ProfilHeadComponent,
    ProfilDossierComponent,
    ProfilHistoriqueComponent,
    // Parts
    UsagersProfilTransfertCourrierComponent,
    UsagersProfilProcurationCourrierComponent,
    ProfilHistoriqueCourriersComponent,
    ProfilStructureDocsComponent,
    ProfilEntretienComponent,
    ProfilEditPreferenceComponent,
    ProfilEtatCivilComponent,
    ProfilEtatCivilFormComponent,
  ],
  exports: [ProfilEtatCivilComponent],
  imports: [
    CommonModule,
    UsagerProfilRoutingModule,
    FontAwesomeModule,
    SharedModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class UsagerProfilModule {}
