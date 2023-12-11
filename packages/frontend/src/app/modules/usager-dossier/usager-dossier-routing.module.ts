import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { StepDecisionComponent } from "./components/step-decision/step-decision.component";
import { StepDocumentsComponent } from "./components/step-documents/step-documents.component";
import { StepEntretienComponent } from "./components/step-entretien/step-entretien.component";
import { StepEtatCivilComponent } from "./components/step-etat-civil/step-etat-civil.component";
import { StepRdvComponent } from "./components/step-rdv/step-rdv.component";

const routes: Routes = [
  {
    path: "nouveau",
    component: StepEtatCivilComponent,
  },
  {
    path: ":id/edit",
    component: StepEtatCivilComponent,
  },
  {
    path: ":id/edit/etat-civil",
    component: StepEtatCivilComponent,
  },
  {
    path: ":id/edit/documents",
    component: StepDocumentsComponent,
  },
  {
    path: ":id/edit/entretien",
    component: StepEntretienComponent,
  },
  {
    path: ":id/edit/rendez-vous",
    component: StepRdvComponent,
  },
  {
    path: ":id/edit/decision",
    component: StepDecisionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerDossierRoutingModule {}
