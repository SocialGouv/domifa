import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { UserProfilComponent } from "./components/user-profil/user-profil.component";

const routes: Routes = [
  {
    component: UserProfilComponent,
    path: "",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsersRoutingModule {}
