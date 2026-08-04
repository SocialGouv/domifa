import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginContainerComponent } from "./components/login-container/login-container.component";
import { LoginFormComponent } from "./components/login/login-form.component";
import { RenewPasswordComponent } from "./components/renew-password/renew-password.component";
import { ResetPasswordComponent } from "../users/components/reset-password/reset-password.component";
import { LoggedGuard, PasswordRenewalGuard } from "../../guards";

const routes: Routes = [
  {
    path: "",
    component: LoginContainerComponent,
    children: [
      {
        path: "",
        redirectTo: "connexion",
        pathMatch: "full",
      },
      {
        canActivate: [LoggedGuard],
        path: "connexion",
        component: LoginFormComponent,
      },
      {
        canActivate: [PasswordRenewalGuard],
        path: "renouveler-mot-de-passe",
        component: RenewPasswordComponent,
      },
      {
        canActivate: [LoggedGuard],
        component: ResetPasswordComponent,
        path: "users/reset-password",
      },
      {
        canActivate: [LoggedGuard],
        component: ResetPasswordComponent,
        path: "users/reset-password/:userId/:token",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAuthRoutingModule {}
