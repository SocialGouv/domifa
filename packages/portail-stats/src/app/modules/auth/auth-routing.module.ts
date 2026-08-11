import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginContainerComponent } from "./components/login-container/login-container.component";
import { LoginComponent } from "./components/login-form/login.component";
import { ResetPasswordComponent } from "./components/reset-password-form/reset-password.component";

const routes: Routes = [
  {
    path: "",
    component: LoginContainerComponent,
    children: [
      { path: "", redirectTo: "auth/login", pathMatch: "full" },
      { path: "login", component: LoginComponent },
      {
        component: ResetPasswordComponent,
        path: "reset-password",
      },
      {
        component: ResetPasswordComponent,
        path: "reset-password/:userId/:token",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
