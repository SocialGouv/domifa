import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";

import { NgbDateCustomParserFormatter } from "../shared/services/date-formatter.service";
import { CustomDatepickerI18n } from "../shared/services/date-french.service";
import { SharedModule } from "../shared/shared.module";
import { UsersModule } from "../users/users.module";
import { UsagerSharedModule } from "../usager-shared/usager-shared.module";
import { DisplayEtatCivilComponent } from "./components/display-etat-civil/display-etat-civil.component";
import { ProfilCourriersComponent } from "./components/pages/profil-courriers/profil-courriers.component";
import { ProfilDocumentsSectionComponent } from "./components/pages/profil-documents-section/profil-documents-section.component";
import { ProfilDossierComponent } from "./components/pages/profil-dossier/profil-dossier.component";
import { ProfilEditPortailUsagerPreferenceComponent } from "./components/profil-edit-portail-usager-preference/profil-edit-portail-usager-preference.component";
import { ProfilGeneralHistoriqueCourriersComponent } from "./components/profil-general-historique-courriers/profil-general-historique-courriers.component";
import { ProfilGeneralSectionComponent } from "./components/pages/profil-general-section/profil-general-section.component";
import { ProfilHeadComponent } from "./components/profil-head/profil-head.component";
import { ProfilHistoriqueCourriersComponent } from "./components/historiques/profil-historique-courriers/profil-historique-courriers.component";
import { UsagersProfilProcurationCourrierComponent } from "./components/profil-procuration-courrier/profil-procuration-courrier-component";
import { ProfilStructureDocsComponent } from "./components/profil-structure-documents/profil-structure-docs.component";
import { UsagersProfilTransfertCourrierComponent } from "./components/profil-transfert-courrier/profil-transfert-courrier-component";
import { UsagerProfilRoutingModule } from "./usager-profil-routing.module";
import { BaseUsagerProfilPageComponent } from "./components/pages/base-usager-profil-page/base-usager-profil-page.component";
import { UsagerNotesModule } from "../usager-notes/usager-notes.module";
import { ProfilHistoriqueComponent } from "./components/pages/profil-historique/profil-historique.component";
import { ProfilHistoriqueSmsComponent } from "./components/historiques/profil-historique-sms/profil-historique-sms.component";
import { ProfilHistoriqueProcurationsComponent } from "./components/historiques/profil-historique-procurations/profil-historique-procurations.component";
import { ProfilHistoriqueTransfertsComponent } from "./components/historiques/profil-historique-transferts/profil-historique-transferts.component";
import { OrderByDatePipe } from "./pipes/order-by-date.pipe";

@NgModule({
  declarations: [
    // Composants principaux : Sections
    ProfilGeneralSectionComponent,
    ProfilCourriersComponent,
    ProfilHeadComponent,
    ProfilDossierComponent,
    ProfilHistoriqueComponent,
    ProfilHistoriqueSmsComponent,
    // Parts
    UsagersProfilTransfertCourrierComponent,
    UsagersProfilProcurationCourrierComponent,
    ProfilHistoriqueCourriersComponent,
    ProfilStructureDocsComponent,

    ProfilEditPortailUsagerPreferenceComponent,
    ProfilDocumentsSectionComponent,
    ProfilGeneralHistoriqueCourriersComponent,
    DisplayEtatCivilComponent,
    BaseUsagerProfilPageComponent,
    ProfilHistoriqueProcurationsComponent,
    ProfilHistoriqueTransfertsComponent,
    OrderByDatePipe,
  ],
  imports: [
    CommonModule,
    UsagerSharedModule,
    FormsModule,
    UsagerNotesModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    SharedModule,
    UsersModule,
    UsagerNotesModule,
    UsagerProfilRoutingModule,
    NgxIntlTelInputModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
})
export class UsagerProfilModule {}
