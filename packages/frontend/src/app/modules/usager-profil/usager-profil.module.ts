import { UsagerSharedModule } from "./../usager-shared/usager-shared.module";
import { UsagerProfilService } from "./services/usager-profil.service";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { UsagerProfilRoutingModule } from "./usager-profil-routing.module";

import { ProfilCourriersComponent } from "./components/profil-courriers/profil-courriers.component";

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
import { DisplayEntretienComponent } from "../usager-shared/components/display-entretien/display-entretien.component";
import { ProfilStructureDocsComponent } from "./components/profil-structure-documents/profil-structure-docs.component";
import { DisplayEtatCivilComponent } from "../usager-shared/components/display-etat-civil/display-etat-civil.component";
import { ProfilDocumentsSectionComponent } from "./components/profil-documents-section/profil-documents-section.component";
import { ProfilGeneralHistoriqueCourriersComponent } from "./components/profil-general-historique-courriers/profil-general-historique-courriers.component";
import { ProfilGeneralSectionComponent } from "./components/profil-general-section/profil-general-section.component";

import { UsersModule } from "../users/users.module";
import { GeneralModule } from "../general/general.module";

@NgModule({
  declarations: [
    // Composants principaux : Sections
    ProfilGeneralSectionComponent,
    ProfilCourriersComponent,
    ProfilHeadComponent,
    ProfilDossierComponent,
    ProfilHistoriqueComponent,
    // Parts
    UsagersProfilTransfertCourrierComponent,
    UsagersProfilProcurationCourrierComponent,
    //
    ProfilHistoriqueCourriersComponent,
    ProfilStructureDocsComponent,
    ProfilEditPreferenceComponent,

    ProfilDocumentsSectionComponent,
    ProfilGeneralHistoriqueCourriersComponent,
  ],

  imports: [
    CommonModule,
    FontAwesomeModule,
    UsagerSharedModule,
    FormsModule,
    GeneralModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    UsagerProfilRoutingModule,
    UsersModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class UsagerProfilModule {}
