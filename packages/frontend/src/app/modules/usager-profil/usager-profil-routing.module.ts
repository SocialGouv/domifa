import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProfilCourriersComponent } from "./components/pages/profil-courriers/profil-courriers.component";
import { ProfilDossierComponent } from "./components/pages/profil-dossier/profil-dossier.component";
import { ProfilHistoriqueComponent } from "./components/pages/profil-historique/profil-historique.component";
import { ProfilGeneralSectionComponent } from "./components/pages/profil-general-section/profil-general-section.component";
import { ProfilDocumentsSectionComponent } from "./components/pages/profil-documents-section/profil-documents-section.component";
import { AuthGuard } from "../../guards";
import { ProfilSmsPortailComponent } from "./components/pages/profil-sms-portail/profil-sms-portail.component";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";

const routes: Routes = [
  {
    path: "dossier/:id",
    component: ProfilDossierComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ALL_USER_STRUCTURE_ROLES,
    },
  },
  {
    path: "historique/:id/:section",
    component: ProfilHistoriqueComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ALL_USER_STRUCTURE_ROLES,
    },
  },
  {
    path: "courriers/:id",
    component: ProfilCourriersComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ALL_USER_STRUCTURE_ROLES,
    },
  },
  {
    path: "sms/:id",
    component: ProfilSmsPortailComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ALL_USER_STRUCTURE_ROLES,
    },
  },
  {
    path: "general/:id",
    component: ProfilGeneralSectionComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ALL_USER_STRUCTURE_ROLES,
    },
  },
  {
    path: "documents/:id",
    component: ProfilDocumentsSectionComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ["admin", "responsable", "simple", "agent"],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerProfilRoutingModule {}
