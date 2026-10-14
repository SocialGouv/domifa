import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EditUserComponent } from "./components/edit-user/edit-user.component";
import { UserProfilComponent } from "./components/user-profil/user-profil.component";
import { SUPPORT_READ_ROLES } from "@domifa/common";
import { AuthGuard } from "../../guards";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: EditUserComponent,
    path: "my-account",
    data: {
      roles: SUPPORT_READ_ROLES,
    },
  },
  {
    canActivate: [AuthGuard],
    component: UserProfilComponent,
    path: "accounts",
    data: {
      roles: ["admin", "responsable", "support"],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsersRoutingModule {}
