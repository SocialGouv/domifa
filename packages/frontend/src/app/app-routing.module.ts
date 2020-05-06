import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { LoggedGuard } from "./guards/logged-guard";
import { StructureGuard } from "./guards/structure-guard";
import { CguComponent } from "./modules/general/components/cgu/cgu.component";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { FaqComponent } from "./modules/general/components/faq/faq.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "./modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { NewsComponent } from "./modules/general/components/news/news.component";
import { DashboardComponent } from "./modules/stats/components/dashboard/dashboard.component";
import { RapportComponent } from "./modules/stats/components/rapport/rapport.component";
import { StructuresConfirmComponent } from "./modules/structures/components/structures-confirm/structures-confirm.component";
import { StructuresEditComponent } from "./modules/structures/components/structures-edit/structures-edit.component";
import { StructuresFormComponent } from "./modules/structures/components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "./modules/structures/components/structures-search/structures-search.component";
import { UsagersFormComponent } from "./modules/usagers/components/form/usagers-form";
import { ImportComponent } from "./modules/usagers/components/import/import.component";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";
import { UsagersProfilComponent } from "./modules/usagers/components/profil/profil-component";
import { RaftComponent } from "./modules/usagers/components/raft/raft.component";
import { LoginComponent } from "./modules/users/components/login/login.component";
import { RegisterUserComponent } from "./modules/users/components/register-user/register-user.component";
import { ResetPasswordComponent } from "./modules/users/components/reset-password/reset-password.component";
import { UserProfilComponent } from "./modules/users/components/user-profil/user-profil.component";
import { PolitiqueComponent } from "./modules/general/components/politique/politique.component";
import { DomifaGuard } from "./guards/domifa-guard";

export const routes: Routes = [
  { path: "", component: HomeComponent },
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
    canActivate: [AuthGuard],
    path: "structure-edit",
    component: StructuresEditComponent,
  },
  {
    component: StructuresConfirmComponent,
    path: "structures/confirm/:token",
  },
  {
    component: StructuresConfirmComponent,
    path: "structures/delete/:token",
  },
  {
    canActivate: [StructureGuard],
    component: RegisterUserComponent,
    path: "inscription/:id",
  },
  {
    canActivate: [AuthGuard],
    component: UserProfilComponent,
    path: "mon-compte",
  },
  {
    canActivate: [AuthGuard],
    component: UsagersProfilComponent,
    path: "usager/:id",
  },
  {
    canActivate: [AuthGuard],
    component: RaftComponent,
    path: "radiation/:id",
  },
  {
    component: ResetPasswordComponent,
    path: "reset-password",
  },
  {
    component: ResetPasswordComponent,
    path: "reset-password/:token",
  },
  {
    canActivate: [AuthGuard],
    path: "nouveau",
    component: UsagersFormComponent,
  },
  {
    canActivate: [AuthGuard],
    component: UsagersFormComponent,
    path: "usager/:id/edit",
  },
  {
    canActivate: [AuthGuard],
    component: UsagersFormComponent,
    path: "usager/:id/renouvellement",
  },
  {
    canActivate: [AuthGuard],
    component: UsagersProfilComponent,
    path: "usager/:id",
  },
  {
    canActivate: [AuthGuard],
    component: ManageUsagersComponent,
    path: "manage",
  },
  {
    canActivate: [DomifaGuard],
    component: DashboardComponent,
    path: "statsdomifa",
  },
  {
    canActivate: [AuthGuard],
    component: RapportComponent,
    path: "rapport-activite",
  },
  { path: "faq", component: FaqComponent },
  { path: "news", component: NewsComponent },
  { path: "mentions-legales", component: MentionsLegalesComponent },
  { path: "confidentialite", component: PolitiqueComponent },
  { path: "cgu", component: CguComponent },
  {
    canActivate: [AuthGuard],
    component: ImportComponent,
    path: "import",
  },
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" },
];
@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
