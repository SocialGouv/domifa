import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { RoleRedirectGuard } from "./guards/redirect-guard";
import { NotFoundComponent } from "./modules/general/components/not-found/not-found.component";
import { CguComponent } from "./modules/general/components/static-pages/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/static-pages/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/static-pages/politique/politique.component";
import { PlanSiteComponent } from "./modules/general/components/static-pages/plan-site/plan-site.component";

const routes: Routes = [
  {
    path: "auth",
    title: "Connexion - Pilotage DomiFa",
    loadChildren: () =>
      import("./modules/auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "stats",
    title: "Statistiques de la domiciliation - Pilotage DomiFa",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/stats/stats.module").then((m) => m.StatsModule),
  },
  {
    path: "",
    canActivate: [RoleRedirectGuard],
    pathMatch: "full",
    children: [],
  },
  {
    path: "mentions-legales",
    title: "Mentions légales - Pilotage DomiFa",
    component: MentionsLegalesComponent,
  },
  {
    path: "plan-site",
    title: "Plan du site - Pilotage DomiFa",
    component: PlanSiteComponent,
  },
  {
    path: "confidentialite",
    title: "Politique de confidentialité - Pilotage DomiFa",
    component: PolitiqueComponent,
  },
  { path: "cgu", title: "CGU - Pilotage DomiFa", component: CguComponent },
  {
    path: "404",
    title: "Page introuvable - Pilotage DomiFa",
    component: NotFoundComponent,
  },
  { path: "**", redirectTo: "404" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
