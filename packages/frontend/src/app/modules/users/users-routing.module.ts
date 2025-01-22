import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoggedGuard } from "../../guards";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";

const routes: Routes = [
  {
    path: "mon-compte",
    redirectTo: "/manage-users/my-account",
  },
  {
    path: "comptes",
    redirectTo: "/manage-users/accounts",
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
