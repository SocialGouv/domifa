import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";
import { UsagerAcceptCguComponent } from "./usager-accept-cgu/usager-accept-cgu.component";

const routes: Routes = [
  { path: "login", component: UsagerLoginComponent },
  { path: "accept-terms", component: UsagerAcceptCguComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerAuthRoutingModule {}
