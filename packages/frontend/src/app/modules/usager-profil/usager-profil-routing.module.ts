import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProfilCourriersComponent } from "./components/profil-courriers/profil-courriers.component";
import { ProfilDossierComponent } from "./components/profil-dossier/profil-dossier.component";
import { ProfilHistoriqueComponent } from "./components/profil-historique/profil-historique.component";
import { ProfilGeneralSectionComponent } from "./components/profil-general-section/profil-general-section.component";
import { ProfilDocumentsSectionComponent } from "./components/profil-documents-section/profil-documents-section.component";

const routes: Routes = [
  { path: "dossier/:id", component: ProfilDossierComponent },
  { path: "historique/:id", component: ProfilHistoriqueComponent },
  { path: "courriers/:id", component: ProfilCourriersComponent },
  { path: "general/:id", component: ProfilGeneralSectionComponent },
  { path: "documents/:id", component: ProfilDocumentsSectionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerProfilRoutingModule {}
