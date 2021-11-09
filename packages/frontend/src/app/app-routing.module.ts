import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CanEditPortailUsagerGuard } from "./guards";
import { AdminGuard } from "./guards/admin-guard";
import { AuthGuard } from "./guards/auth-guard";
import { CanEditSmsGuard } from "./guards/can-edit-sms.guard";
import { DomifaGuard } from "./guards/domifa-guard";
import { FacteurGuard } from "./guards/facteur-guard";
import { LoggedGuard } from "./guards/logged-guard";
import { CguComponent } from "./modules/general/components/cgu/cgu.component";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { FaqComponent } from "./modules/general/components/faq/faq.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "./modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { NewsComponent } from "./modules/general/components/news/news.component";
import { PolitiqueComponent } from "./modules/general/components/politique/politique.component";
import { StructuresConfirmComponent } from "./modules/structures/components/structures-confirm/structures-confirm.component";
import { StructuresEditComponent } from "./modules/structures/components/structures-edit/structures-edit.component";
import { StructuresFormComponent } from "./modules/structures/components/structures-form/structures-form.component";
import { StructuresPortailUsagerFormComponent } from "./modules/structures/components/structures-portail-usager-form/structures-portail-usager-form.component";
import { StructuresSearchComponent } from "./modules/structures/components/structures-search/structures-search.component";
import { StructuresSmsFormComponent } from "./modules/structures/components/structures-sms-form/structures-sms-form.component";

import { ImportComponent } from "./modules/usagers/components/import/import.component";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";
import { EditUserComponent } from "./modules/users/components/edit-user/edit-user.component";
import { LoginComponent } from "./modules/users/components/login/login.component";
import { ResetPasswordComponent } from "./modules/users/components/reset-password/reset-password.component";
import { UserProfilComponent } from "./modules/users/components/user-profil/user-profil.component";

export const routes: Routes = [
  {
    canActivate: [LoggedGuard],
    component: LoginComponent,
    path: "connexion",
  },
  {
    canActivate: [LoggedGuard],
    path: "inscription",
    component: StructuresSearchComponent,
  },
  {
    canActivate: [LoggedGuard],
    path: "structures/nouveau",
    component: StructuresFormComponent,
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: "structure-edit",
    component: StructuresEditComponent,
  },
  {
    canActivate: [AuthGuard],
    path: "mon-compte",
    component: EditUserComponent,
  },
  {
    canActivate: [AuthGuard, AdminGuard, CanEditSmsGuard],
    path: "structures/sms",
    component: StructuresSmsFormComponent,
  },
  {
    canActivate: [AuthGuard, AdminGuard, CanEditPortailUsagerGuard],
    path: "structures/portail-usager",
    component: StructuresPortailUsagerFormComponent,
  },
  {
    component: StructuresConfirmComponent,
    path: "structures/confirm/:id/:token",
  },
  {
    component: StructuresConfirmComponent,
    path: "structures/delete/:id/:token",
  },
  {
    canActivate: [AuthGuard],
    component: UserProfilComponent,
    path: "admin",
  },

  {
    canActivate: [LoggedGuard],
    component: ResetPasswordComponent,
    path: "reset-password",
  },
  {
    canActivate: [LoggedGuard],
    component: ResetPasswordComponent,
    path: "reset-password/:userId/:token",
  },

  {
    canActivate: [AuthGuard],
    component: ManageUsagersComponent,
    path: "manage",
  },
  {
    path: "nouveau",
    redirectTo: "/usager/nouveau",
  },
  { path: "", component: HomeComponent },
  { path: "faq", component: FaqComponent },
  { path: "news", component: NewsComponent },
  { path: "mentions-legales", component: MentionsLegalesComponent },
  { path: "confidentialite", component: PolitiqueComponent },
  { path: "cgu", component: CguComponent },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: ImportComponent,
    path: "import",
  },
  {
    path: "statsdomifa",
    redirectTo: "/admin-domifa",
  },
  {
    path: "rapport-activite",
    redirectTo: "/stats/rapport-activite",
  },
  {
    path: "stats",
    loadChildren: () =>
      import("./modules/stats/stats.module").then((m) => m.StatsModule),
  },
  {
    path: "usager",
    loadChildren: () =>
      import("./modules/usager-dossier/usager-dossier.module").then(
        (m) => m.UsagerDossierModule
      ),
  },
  {
    canActivate: [AuthGuard, DomifaGuard],
    path: "admin-domifa",
    loadChildren: () =>
      import("./modules/admin-domifa/admin-domifa.module").then(
        (m) => m.AdminDomifaModule
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
  // NEW  LAZY LOAD MODULES
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" },
];
@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
})
export class AppRoutingModule {}
