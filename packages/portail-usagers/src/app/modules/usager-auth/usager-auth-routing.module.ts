import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UsagerLoginComponent } from "./usager-login/usager-login.component";
import { LoggedGuard } from "../../guards/logged-guard";

const routes: Routes = [
  {
    path: "login",
    component: UsagerLoginComponent,
    canActivate: [LoggedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerAuthRoutingModule {}
