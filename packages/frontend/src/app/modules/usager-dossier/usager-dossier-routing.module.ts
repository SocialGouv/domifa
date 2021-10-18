import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard, FacteurGuard } from "../../guards";
import { StepDecisionComponent } from "./components/step-decision/step-decision.component";
import { StepDocumentsComponent } from "./components/step-documents/step-documents.component";
import { StepEntretienComponent } from "./components/step-entretien/step-entretien.component";
import { StepEtatCivilComponent } from "./components/step-etat-civil/step-etat-civil.component";
import { StepRdvComponent } from "./components/step-rdv/step-rdv.component";

const routes: Routes = [
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: "nouveau",
    component: StepEtatCivilComponent,
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StepEtatCivilComponent,
    path: ":id/edit",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StepEtatCivilComponent,
    path: ":id/edit/etat-civil",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StepDocumentsComponent,
    path: ":id/edit/documents",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StepEntretienComponent,
    path: ":id/edit/entretien",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StepRdvComponent,
    path: ":id/edit/rendez-vous",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StepDecisionComponent,
    path: ":id/edit/decision",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerDossierRoutingModule {}
