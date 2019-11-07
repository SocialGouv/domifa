import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth-guard";
import { LoggedGuard } from "./guards/logged-guard";
import { StructureGuard } from "./guards/structure-guard";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { FaqComponent } from "./modules/general/components/faq/faq.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "./modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { StructuresConfirmComponent } from "./modules/structures/components/structures-confirm/structures-confirm.component";
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

export const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    canActivate: [LoggedGuard],
    component: LoginComponent,
    path: "connexion"
  },
  { path: "inscription", component: StructuresSearchComponent },
  { path: "structures/nouveau", component: StructuresFormComponent },
  {
    component: StructuresConfirmComponent,
    path: "structures/confirm/:token"
  },
  {
    component: StructuresConfirmComponent,
    path: "structures/delete/:token"
  },
  {
    canActivate: [StructureGuard],
    component: RegisterUserComponent,
    path: "inscription/:id"
  },
  {
    canActivate: [AuthGuard],
    component: UserProfilComponent,
    path: "mon-compte"
  },
  {
    canActivate: [AuthGuard],
    component: UsagersProfilComponent,
    path: "usager/:id"
  },
  {
    canActivate: [AuthGuard],
    component: RaftComponent,
    path: "radiation/:id"
  },
  {
    canActivate: [LoggedGuard],
    component: ResetPasswordComponent,
    path: "reset-password"
  },
  {
    canActivate: [LoggedGuard],
    component: ResetPasswordComponent,
    path: "reset-password/:token"
  },
  { path: "nouveau", component: UsagersFormComponent },
  {
    component: UsagersFormComponent,
    path: "usager/:id/edit"
  },
  {
    canActivate: [AuthGuard],
    component: UsagersFormComponent,
    path: "usager/:id/renouvellement"
  },
  {
    canActivate: [AuthGuard],
    component: UsagersProfilComponent,
    path: "usager/:id"
  },
  {
    canActivate: [AuthGuard],
    component: ManageUsagersComponent,
    path: "manage"
  },
  { path: "faq", component: FaqComponent },
  { path: "mentions-legales", component: MentionsLegalesComponent },
  {
    canActivate: [AuthGuard],
    component: ImportComponent,
    path: "import"
  },
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" }
];
@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}
