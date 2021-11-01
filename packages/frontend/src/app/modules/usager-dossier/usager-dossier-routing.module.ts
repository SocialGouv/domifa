import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard, FacteurGuard } from "../../guards";
import { StepDecisionComponent } from "./components/step-decision/step-decision.component";
import { StepDocumentsComponent } from "./components/step-documents/step-documents.component";
import { StepEntretienComponent } from "./components/step-entretien/step-entretien.component";
import { StepEtatCivilComponent } from "./components/step-etat-civil/step-etat-civil.component";
import { StepRdvComponent } from "./components/step-rdv/step-rdv.component";
import { StepLayoutComponent } from "./components/step-layout/step-layout.component";

const routes: Routes = [
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: "nouveau",
    component: StepLayoutComponent,
    children: [{ path: "", component: StepEtatCivilComponent }],
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: ":id/edit",
    component: StepLayoutComponent,
    children: [{ path: "", component: StepEtatCivilComponent }],
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: ":id/edit/etat-civil",
    component: StepLayoutComponent,
    children: [{ path: "", component: StepEtatCivilComponent }],
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: ":id/edit/documents",
    component: StepLayoutComponent,
    children: [{ path: "", component: StepDocumentsComponent }],
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: ":id/edit/entretien",
    component: StepLayoutComponent,
    children: [{ path: "", component: StepEntretienComponent }],
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: ":id/edit/rendez-vous",
    component: StepLayoutComponent,
    children: [{ path: "", component: StepRdvComponent }],
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: ":id/edit/decision",
    component: StepLayoutComponent,
    children: [{ path: "", component: StepDecisionComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerDossierRoutingModule {}
