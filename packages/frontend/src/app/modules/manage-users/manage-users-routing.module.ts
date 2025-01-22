import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard, ResponsableGuard } from "../../guards";
import { EditUserComponent } from "./components/edit-user/edit-user.component";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: EditUserComponent,
    path: "my-account",
  },

  {
    canActivate: [AuthGuard, ResponsableGuard],
    component: UserProfilComponent,
    path: "accounts",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsersRoutingModule {}
