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

@NgModule({
  declarations: [
    ProfilOverviewComponent,
    ProfilCourriersComponent,
    ProfilHeadComponent,
    ProfilDossierComponent,
    ProfilHistoriqueComponent,
    // Parts
    UsagersProfilTransfertCourrierComponent,
    UsagersProfilProcurationCourrierComponent,
  ],
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
