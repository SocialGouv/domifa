import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ResetPasswordComponent } from "./components/reset-password/reset-password.component";

const routes: Routes = [
  {
    component: ResetPasswordComponent,
    path: "reset-password",
  },
  {
    component: ResetPasswordComponent,
    path: "reset-password/:userId/:token",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
