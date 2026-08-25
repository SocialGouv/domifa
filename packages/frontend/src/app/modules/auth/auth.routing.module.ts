import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginContainerComponent } from "./components/login-container/login-container.component";
import { LoginFormComponent } from "./components/login/login-form.component";
import { ResetPasswordComponent } from "../users/components/reset-password/reset-password.component";
import { ConfirmEmailUpdateComponent } from "../users/components/confirm-email-update/confirm-email-update.component";
import { LoggedGuard } from "../../guards";

const routes: Routes = [
  {
    path: "",
    component: LoginContainerComponent,
    children: [
      { path: "", redirectTo: "connexion", pathMatch: "full" },
      {
        canActivate: [LoggedGuard],
        path: "connexion",
        component: LoginFormComponent,
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
      {
        // Pas de LoggedGuard : accessible même connecté (on déconnecte
        // silencieusement dans le composant plutôt que de bloquer l'accès).
        component: ConfirmEmailUpdateComponent,
        path: "users/confirm-email-update/:userId/:token",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAuthRoutingModule {}
