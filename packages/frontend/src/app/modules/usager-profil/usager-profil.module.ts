import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
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
import { ProfilAddNoteFormComponent } from "./components/profil-add-note-form/profil-add-note-form.component";
import { ProfilCourriersComponent } from "./components/profil-courriers/profil-courriers.component";
import { ProfilDocumentsSectionComponent } from "./components/profil-documents-section/profil-documents-section.component";
import { ProfilDossierComponent } from "./components/profil-dossier/profil-dossier.component";
import { ProfilEditPreferenceComponent } from "./components/profil-edit-preference/profil-edit-preference.component";
import { ProfilEtatCivilFormComponent } from "./components/profil-etat-civil-form/profil-etat-civil-form.component";
import { ProfilGeneralHistoriqueCourriersComponent } from "./components/profil-general-historique-courriers/profil-general-historique-courriers.component";
import { ProfilGeneralNotesComponent } from "./components/profil-general-notes/profil-general-notes.component";
import { ProfilGeneralSectionComponent } from "./components/profil-general-section/profil-general-section.component";
import { ProfilHeadComponent } from "./components/profil-head/profil-head.component";
import { ProfilHistoriqueCourriersComponent } from "./components/profil-historique-courriers/profil-historique-courriers.component";
import { ProfilHistoriqueNotesComponent } from "./components/profil-historique-notes/profil-historique-notes.component";
import { ProfilHistoriqueSmsComponent } from "./components/profil-historique-sms/profil-historique-sms.component";
import { ProfilHistoriqueComponent } from "./components/profil-historique/profil-historique.component";
import { UsagersProfilProcurationCourrierComponent } from "./components/profil-procuration-courrier/profil-procuration-courrier-component";
import { ProfilStructureDocsComponent } from "./components/profil-structure-documents/profil-structure-docs.component";
import { UsagersProfilTransfertCourrierComponent } from "./components/profil-transfert-courrier/profil-transfert-courrier-component";
import { UsagerProfilRoutingModule } from "./usager-profil-routing.module";

@NgModule({
  declarations: [
    // Composants principaux : Sections
    ProfilGeneralSectionComponent,
    ProfilCourriersComponent,
    ProfilHeadComponent,
    ProfilDossierComponent,
    ProfilHistoriqueComponent,
    ProfilHistoriqueNotesComponent,
    ProfilHistoriqueSmsComponent,
    ProfilGeneralNotesComponent,
    ProfilAddNoteFormComponent,
    // Parts
    UsagersProfilTransfertCourrierComponent,
    UsagersProfilProcurationCourrierComponent,
    ProfilHistoriqueCourriersComponent,
    ProfilStructureDocsComponent,
    ProfilEditPreferenceComponent,
    ProfilEtatCivilFormComponent,

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
