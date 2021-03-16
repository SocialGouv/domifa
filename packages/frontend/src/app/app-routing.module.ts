import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { DomifaGuard } from "./guards/domifa-guard";
import { FacteurGuard } from "./guards/facteur-guard";
import { LoggedGuard } from "./guards/logged-guard";
import { ResponsableGuard } from "./guards/responsable-guard";
import { StructureGuard } from "./guards/structure-guard";
import { CguComponent } from "./modules/general/components/cgu/cgu.component";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { FaqComponent } from "./modules/general/components/faq/faq.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "./modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { NewsComponent } from "./modules/general/components/news/news.component";
import { PolitiqueComponent } from "./modules/general/components/politique/politique.component";
import { DashboardComponent } from "./modules/stats/components/dashboard/dashboard.component";
import { StatsComponent } from "./modules/stats/components/stats/stats.component";
import { StructuresConfirmComponent } from "./modules/structures/components/structures-confirm/structures-confirm.component";
import { StructuresEditComponent } from "./modules/structures/components/structures-edit/structures-edit.component";
import { StructuresFormComponent } from "./modules/structures/components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "./modules/structures/components/structures-search/structures-search.component";
import { DecisionComponent } from "./modules/usagers/components/form/parts/decision/decision.component";
import { DocumentsFormComponent } from "./modules/usagers/components/form/parts/documents-form/documents-form.component";
import { EntretienFormComponent } from "./modules/usagers/components/form/parts/entretien-form/entretien-form.component";
import { RdvComponent } from "./modules/usagers/components/form/parts/rdv/rdv.component";
import { UsagersFormComponent } from "./modules/usagers/components/form/usagers-form";
import { ImportComponent } from "./modules/usagers/components/import/import.component";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";
import { UsagersProfilComponent } from "./modules/usagers/components/profil/profil-component";
import { RaftComponent } from "./modules/usagers/components/raft/raft.component";
import { EditUserComponent } from "./modules/users/components/edit-user/edit-user.component";
import { LoginComponent } from "./modules/users/components/login/login.component";
import { RegisterUserComponent } from "./modules/users/components/register-user/register-user.component";
import { ResetPasswordComponent } from "./modules/users/components/reset-password/reset-password.component";
import { UserProfilComponent } from "./modules/users/components/user-profil/user-profil.component";

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
    component: StructuresConfirmComponent,
    path: "structures/confirm/:id/:token",
  },
  {
    component: StructuresConfirmComponent,
    path: "structures/delete/:id/:token",
  },
  {
    canActivate: [StructureGuard],
    component: RegisterUserComponent,
    path: "inscription/:id",
  },
  {
    canActivate: [AuthGuard],
    component: UserProfilComponent,
    path: "admin",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: RaftComponent,
    path: "radiation/:id",
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
    canActivate: [AuthGuard, FacteurGuard],
    path: "nouveau",
    component: UsagersFormComponent,
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: UsagersFormComponent,
    path: "usager/:id/edit",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: UsagersFormComponent,
    path: "usager/:id/edit/etat-civil",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: DocumentsFormComponent,
    path: "usager/:id/edit/documents",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: EntretienFormComponent,
    path: "usager/:id/edit/entretien",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: RdvComponent,
    path: "usager/:id/edit/rendez-vous",
  },

  {
    canActivate: [AuthGuard, FacteurGuard],
    component: DecisionComponent,
    path: "usager/:id/edit/decision",
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
    canActivate: [DomifaGuard, ResponsableGuard],
    component: DashboardComponent,
    path: "statsdomifa",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StatsComponent,
    path: "rapport-activite",
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    component: StatsComponent,
    path: "stats",
  },
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
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" },
];
@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
