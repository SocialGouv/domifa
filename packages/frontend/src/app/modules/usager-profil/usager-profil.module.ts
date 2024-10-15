import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../shared/shared.module";
import { UsagerSharedModule } from "../usager-shared/usager-shared.module";
import { DisplayEtatCivilComponent } from "./components/_general-section/display-etat-civil/display-etat-civil.component";
import { ProfilCourriersComponent } from "./components/pages/profil-courriers/profil-courriers.component";
import { ProfilDocumentsSectionComponent } from "./components/pages/profil-documents-section/profil-documents-section.component";
import { ProfilDossierComponent } from "./components/pages/profil-dossier/profil-dossier.component";
import { ProfilEditPortailUsagerPreferenceComponent } from "./components/_courriers/profil-edit-portail-usager-preference/profil-edit-portail-usager-preference.component";
import { ProfilGeneralHistoriqueCourriersComponent } from "./components/_general-section/profil-general-historique-courriers/profil-general-historique-courriers.component";
import { ProfilGeneralSectionComponent } from "./components/pages/profil-general-section/profil-general-section.component";
import { ProfilHeadComponent } from "./components/profil-head/profil-head.component";
import { ProfilHistoriqueCourriersComponent } from "./components/_historiques/profil-historique-courriers/profil-historique-courriers.component";
import { UsagersProfilProcurationCourrierComponent } from "./components/_courriers/profil-procuration-courrier/profil-procuration-courrier-component";
import { ProfilStructureDocsComponent } from "./components/_documents/profil-structure-documents/profil-structure-docs.component";
import { UsagersProfilTransfertCourrierComponent } from "./components/_courriers/profil-transfert-courrier/profil-transfert-courrier-component";
import { UsagerProfilRoutingModule } from "./usager-profil-routing.module";
import { BaseUsagerProfilPageComponent } from "./components/pages/base-usager-profil-page/base-usager-profil-page.component";
import { UsagerNotesModule } from "../usager-notes/usager-notes.module";
import { ProfilHistoriqueComponent } from "./components/pages/profil-historique/profil-historique.component";
import { ProfilHistoriqueSmsComponent } from "./components/_historiques/profil-historique-sms/profil-historique-sms.component";
import { ProfilHistoriqueProcurationsComponent } from "./components/_historiques/profil-historique-procurations/profil-historique-procurations.component";
import { ProfilHistoriqueTransfertsComponent } from "./components/_historiques/profil-historique-transferts/profil-historique-transferts.component";
import { ProfilHistoriqueDecisionsComponent } from "./components/_historiques/profil-historique-decisions/profil-historique-decisions.component";
import { ProfilHistoriqueNotesComponent } from "./components/_historiques/profil-historique-notes/profil-historique-notes.component";
import { TableHeadSortComponent } from "../shared/components/table-head-sort/table-head-sort.component";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
} from "../shared/services";
import { ProfilHistoriqueLoginPortailComponent } from "./components/_historiques/profil-historique-login-portail/profil-historique-login-portail.component";
import { SetNpaiComponent } from "./components/_general-section/set-npai/set-npai.component";

import { DisplayContactDetailsComponent } from "./components/_general-section/display-contact-details/display-contact-details.component";
import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";
import { FormatInternationalPhoneNumberPipe } from "../usager-shared/formatInternationalPhoneNumber.pipe";
import { ProfilSmsPortailComponent } from "./components/pages/profil-sms-portail/profil-sms-portail.component";
import { SortArrayPipe } from "../shared/pipes";
import { DisplayTableImageComponent } from "../shared/components/display-table-image/display-table-image.component";

@NgModule({
  declarations: [
    ProfilGeneralSectionComponent,
    ProfilCourriersComponent,
    ProfilHeadComponent,
    ProfilDossierComponent,
    ProfilHistoriqueComponent,
    ProfilHistoriqueSmsComponent,
    ProfilHistoriqueNotesComponent,
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
    ProfilHistoriqueDecisionsComponent,
    ProfilHistoriqueLoginPortailComponent,
    SetNpaiComponent,
    DisplayContactDetailsComponent,
    ProfilSmsPortailComponent,
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
    UsagerNotesModule,
    UsagerProfilRoutingModule,
    TableHeadSortComponent,
    NgxIntlTelInputModule,
    FormatInternationalPhoneNumberPipe,
    SortArrayPipe,
    DisplayTableImageComponent,
  ],
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UsagerProfilModule {}
