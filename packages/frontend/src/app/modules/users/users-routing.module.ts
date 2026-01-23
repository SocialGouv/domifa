import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "mon-compte",
    redirectTo: "/manage-users/my-account",
  },
  {
    path: "comptes",
    redirectTo: "/manage-users/accounts",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
