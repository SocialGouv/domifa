import { NgModule } from "@angular/core";

import { ExtraOptions, RouterModule, Routes } from "@angular/router";

import { LoggedGuard } from "./guards/logged.guard";
import { CguComponent } from "./modules/general/components/static-pages/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/static-pages/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/static-pages/politique/politique.component";
import { ContactSupportComponent } from "./modules/general/components/contact-support/contact-support.component";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { FaqComponent } from "./modules/general/components/faq/faq.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { LoginComponent } from "./modules/general/components/login/login.component";
import { NewsComponent } from "./modules/general/components/news/news.component";
import { PlanSiteComponent } from "./modules/general/components/plan-site/plan-site.component";
import { CguResponsableComponent } from "./modules/general/components/static-pages/cgu-responsable/cgu-responsable.component";
import { RgaaComponent } from "./modules/general/components/static-pages/rgaa/rgaa.component";
import { AuthGuard, FacteurGuard } from "./guards";
import { LandingPagePortailComponent } from "./modules/general/components/static-pages/landing-page-portail/landing-page-portail.component";

export const routes: Routes = [
  {
    path: "nouveau",
    redirectTo: "/usager/nouveau",
  },
  {
    path: "admin",
    redirectTo: "users/admin",
  },
  {
    path: "reset-password",
    redirectTo: "users/reset-password",
  },
  {
    path: "reset-password/:userId/:token",
    redirectTo: "users/reset-password/:userId/:token",
  },
  { component: HomeComponent, path: "" },
  { component: RgaaComponent, path: "accessibilite" },
  { component: FaqComponent, path: "faq" },
  { component: ContactSupportComponent, path: "contact" },
  { component: NewsComponent, path: "news" },
  { component: MentionsLegalesComponent, path: "mentions-legales" },
  { component: PolitiqueComponent, path: "confidentialite" },
  { component: CguComponent, path: "cgu" },
  { component: CguResponsableComponent, path: "cgu-responsable" },
  { component: PlanSiteComponent, path: "plan-site" },
  { component: LandingPagePortailComponent, path: "portail-mon-domifa" },
  {
    canActivate: [LoggedGuard],
    component: LoginComponent,
    path: "connexion",
  },
  {
    loadChildren: () =>
      import("./modules/stats/stats.module").then((m) => m.StatsModule),
    path: "stats",
  },
  {
    loadChildren: () =>
      import("./modules/structure-stats/structure-stats.module").then(
        (m) => m.StructureStatsModule
      ),
    path: "structure-stats",
  },
  {
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/manage-usagers/manage-usagers.module").then(
        (m) => m.ManageUsagersModule
      ),
    path: "manage",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    loadChildren: () =>
      import("./modules/import-usagers/import-usagers.module").then(
        (m) => m.ImportUsagersModule
      ),
    path: "import",
  },
  {
    loadChildren: () =>
      import("./modules/users/users.module").then((m) => m.UsersModule),
    path: "users",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    loadChildren: () =>
      import("./modules/usager-dossier/usager-dossier.module").then(
        (m) => m.UsagerDossierModule
      ),
    path: "usager",
  },
  {
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./modules/usager-profil/usager-profil.module").then(
        (m) => m.UsagerProfilModule
      ),
    path: "profil",
  },
  {
    loadChildren: () =>
      import("./modules/structures/structures.module").then(
        (m) => m.StructuresModule
      ),
    path: "structures",
  },
  { component: NotFoundComponent, path: "404" },
  { path: "**", redirectTo: "404" },
];

const routerOptions: ExtraOptions = {
  anchorScrolling: "enabled",
  onSameUrlNavigation: "reload",
};

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, routerOptions)],
})
export class AppRoutingModule {}
