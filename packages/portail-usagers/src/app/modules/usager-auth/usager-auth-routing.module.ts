import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";

const routes: Routes = [{ path: "login", component: UsagerLoginComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerAuthRoutingModule {}
