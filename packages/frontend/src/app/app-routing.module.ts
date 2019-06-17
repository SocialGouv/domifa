import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotFoundComponent } from "./modules/general/components/errors/not-found/not-found.component";
import { HomeComponent } from "./modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "./modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { UsagersFormComponent } from "./modules/usagers/components/form/usagers-form";
import { ManageUsagersComponent } from "./modules/usagers/components/manage/manage.component";
import { UsagersProfilComponent } from "./modules/usagers/components/profil/profil-component";
import { RegisterUserComponent } from "./modules/users/components/register-user/register-user.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "nouveau", component: UsagersFormComponent },
  { path: "profil/:id/edit", component: UsagersFormComponent },
  { path: "profil/:id", component: UsagersProfilComponent },
  { path: "manage", component: ManageUsagersComponent },
  { path: "inscription", component: RegisterUserComponent },
  { path: "mentions-legales", component: MentionsLegalesComponent },
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "404" }
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}
