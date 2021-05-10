import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProfilCourriersComponent } from "./components/profil-courriers/profil-courriers.component";
import { ProfilDossierComponent } from "./components/profil-dossier/profil-dossier.component";
import { ProfilHistoriqueComponent } from "./components/profil-historique/profil-historique.component";
import { ProfilOverviewComponent } from "./components/profil-overview/profil-overview.component";

const routes: Routes = [
  { path: "dossier/:id", component: ProfilDossierComponent },
  { path: "historique/:id", component: ProfilHistoriqueComponent },
  { path: "courriers/:id", component: ProfilCourriersComponent },
  { path: ":id", component: ProfilOverviewComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerProfilRoutingModule {}
