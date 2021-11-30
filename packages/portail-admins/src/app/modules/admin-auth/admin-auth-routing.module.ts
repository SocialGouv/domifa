import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminLoginComponent } from "./admin-login/admin-login.component";

const routes: Routes = [{ path: "login", component: AdminLoginComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAuthRoutingModule {}
