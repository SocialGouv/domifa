import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProfilCourriersComponent } from "./components/pages/profil-courriers/profil-courriers.component";
import { ProfilDossierComponent } from "./components/pages/profil-dossier/profil-dossier.component";
import { ProfilHistoriqueComponent } from "./components/pages/profil-historique/profil-historique.component";
import { ProfilGeneralSectionComponent } from "./components/pages/profil-general-section/profil-general-section.component";
import { ProfilDocumentsSectionComponent } from "./components/pages/profil-documents-section/profil-documents-section.component";
import { FacteurGuard } from "../../guards";
import { ProfilSmsPortailComponent } from "./components/pages/profil-sms-portail/profil-sms-portail.component";

const routes: Routes = [
  { path: "dossier/:id", component: ProfilDossierComponent },
  { path: "historique/:id/:section", component: ProfilHistoriqueComponent },
  { path: "courriers/:id", component: ProfilCourriersComponent },
  { path: "sms/:id", component: ProfilSmsPortailComponent },
  { path: "general/:id", component: ProfilGeneralSectionComponent },
  {
    path: "documents/:id",
    component: ProfilDocumentsSectionComponent,
    canActivate: [FacteurGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerProfilRoutingModule {}
