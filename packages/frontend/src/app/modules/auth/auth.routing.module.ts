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
        // Pas de LoggedGuard : accessible même connecté. Le backend révoque
        // déjà la session serveur en cas de succès ; le prochain appel API
        // du navigateur suffira à faire réagir l'intercepteur global, sans
        // faire disparaître cette page sous les yeux de la personne.
        component: ConfirmEmailUpdateComponent,
        path: "users/confirm-email-update/:uuid/:token",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAuthRoutingModule {}
