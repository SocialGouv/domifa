import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EditUserComponent } from "./components/edit-user/edit-user.component";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";
import { AuthGuard } from "../../guards";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: EditUserComponent,
    path: "my-account",
    data: {
      roles: ALL_USER_STRUCTURE_ROLES,
    },
  },
  {
    canActivate: [AuthGuard],
    component: UserProfilComponent,
    path: "accounts",
    data: {
      roles: ["admin", "responsable"],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsersRoutingModule {}
