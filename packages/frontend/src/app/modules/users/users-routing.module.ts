import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard, LoggedGuard } from "../../guards";
import { EditUserComponent } from "./components/edit-user/edit-user.component";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    path: "mon-compte",
    component: EditUserComponent,
  },

  {
    canActivate: [AuthGuard],
    component: UserProfilComponent,
    path: "comptes",
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
