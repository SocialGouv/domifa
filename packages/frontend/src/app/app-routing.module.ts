import { NgModule } from "@angular/core";

import { ExtraOptions, RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "./guards/auth-guard";
import { FacteurGuard } from "./guards/facteur-guard";
import { LoggedGuard } from "./guards/logged-guard";
import { CguComponent } from "./modules/general/components/_static/cgu/cgu.component";
import { MentionsLegalesComponent } from "./modules/general/components/_static/mentions-legales/mentions-legales.component";
import { PolitiqueComponent } from "./modules/general/components/_static/politique/politique.component";
import { ContactSupportComponent } from "./modules/general/components/contact-support/contact-support.component";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { FaqComponent } from "./modules/general/components/faq/faq.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { LoginComponent } from "./modules/general/components/login/login.component";
import { NewsComponent } from "./modules/general/components/news/news.component";
import { PlanSiteComponent } from "./modules/general/components/plan-site/plan-site.component";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";

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
  { component: FaqComponent, path: "faq" },
  { component: ContactSupportComponent, path: "contact" },
  { component: NewsComponent, path: "news" },
  { component: MentionsLegalesComponent, path: "mentions-legales" },
  { component: PolitiqueComponent, path: "confidentialite" },
  { component: CguComponent, path: "cgu" },
  { component: PlanSiteComponent, path: "plan-site" },
  {
    canActivate: [LoggedGuard],
    component: LoginComponent,
    path: "connexion",
  },
  {
    canActivate: [AuthGuard],
    component: ManageUsagersComponent,
    path: "manage",
  },
  {
    loadChildren: async () =>
      import("./modules/stats/stats.module").then((m) => m.StatsModule),
    path: "stats",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    loadChildren: async () =>
      import("./modules/import-usagers/import-usagers.module").then(
        (m) => m.ImportUsagersModule
      ),
    path: "import",
  },
  {
    loadChildren: async () =>
      import("./modules/users/users.module").then((m) => m.UsersModule),
    path: "users",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    loadChildren: async () =>
      import("./modules/usager-dossier/usager-dossier.module").then(
        (m) => m.UsagerDossierModule
      ),
    path: "usager",
  },
  {
    canActivate: [AuthGuard],
    loadChildren: async () =>
      import("./modules/usager-profil/usager-profil.module").then(
        (m) => m.UsagerProfilModule
      ),
    path: "profil",
  },
  {
    loadChildren: async () =>
      import("./modules/structures/structures.module").then(
        (m) => m.StructuresModule
      ),
    path: "structures",
  },
  // 404 Page
  { component: NotFoundComponent, path: "404" },
  { path: "**", redirectTo: "404" },
];

const routerOptions: ExtraOptions = {
  anchorScrolling: "enabled",
  relativeLinkResolution: "legacy",
};

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, routerOptions)],
})
export class AppRoutingModule {}