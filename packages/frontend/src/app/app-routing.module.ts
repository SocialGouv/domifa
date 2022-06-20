import { ContactSupportComponent } from "./modules/general/components/contact-support/contact-support.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes, ExtraOptions } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { FacteurGuard } from "./guards/facteur-guard";
import { LoggedGuard } from "./guards/logged-guard";
import { CguComponent } from "./modules/general/components/_static/cgu/cgu.component";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { FaqComponent } from "./modules/general/components/faq/faq.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "./modules/general/components/_static/mentions-legales/mentions-legales.component";
import { NewsComponent } from "./modules/general/components/news/news.component";
import { PolitiqueComponent } from "./modules/general/components/_static/politique/politique.component";
import { ImportComponent } from "./modules/usagers/components/import/import.component";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";
import { PlanSiteComponent } from "./modules/general/components/plan-site/plan-site.component";
import { LoginComponent } from "./modules/general/components/login/login.component";

export const routes: Routes = [
  // ---
  // DEBUT Redirection
  // ---
  {
    path: "nouveau",
    redirectTo: "/usager/nouveau",
  },
  {
    path: "structure-edit",
    redirectTo: "/structures/edit",
  },
  {
    path: "inscription",
    redirectTo: "/structures/inscription",
  },
  {
    path: "rapport-activite",
    redirectTo: "/stats/rapport-activite",
  },
  {
    path: "mon-compte",
    redirectTo: "users/mon-compte",
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
  // ---
  // FIN Redirection
  // ---
  { path: "", component: HomeComponent },
  { path: "faq", component: FaqComponent },
  { path: "contact", component: ContactSupportComponent },
  { path: "news", component: NewsComponent },
  { path: "mentions-legales", component: MentionsLegalesComponent },
  { path: "confidentialite", component: PolitiqueComponent },
  { path: "cgu", component: CguComponent },
  { path: "plan-site", component: PlanSiteComponent },
  {
    canActivate: [LoggedGuard],
    component: LoginComponent,
    path: "connexion",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: ImportComponent, // TODO: migrer l'import vers un module à part
    path: "import",
  },
  {
    canActivate: [AuthGuard],
    component: ManageUsagersComponent,
    path: "manage",
  },
  {
    path: "stats",
    loadChildren: () =>
      import("./modules/stats/stats.module").then((m) => m.StatsModule),
  },
  {
    path: "users",
    loadChildren: () =>
      import("./modules/users/users.module").then((m) => m.UsersModule),
  },
  {
    path: "usager",
    loadChildren: () =>
      import("./modules/usager-dossier/usager-dossier.module").then(
        (m) => m.UsagerDossierModule
      ),
  },
  {
    canActivate: [AuthGuard],
    path: "profil",
    loadChildren: () =>
      import("./modules/usager-profil/usager-profil.module").then(
        (m) => m.UsagerProfilModule
      ),
  },
  {
    path: "structures",
    loadChildren: () =>
      import("./modules/structures/structures.module").then(
        (m) => m.StructuresModule
      ),
  },
  // 404 Page
  { path: "404", component: NotFoundComponent },
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
