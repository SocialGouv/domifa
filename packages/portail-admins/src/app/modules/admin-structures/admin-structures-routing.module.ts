import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../guards/auth-guard";
import { AdminStructuresListComponent } from "./components/admin-structures-list/admin-structures-list.component";

const routes: Routes = [
  {
    path: "",
    component: AdminStructuresListComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ["super-admin-domifa"],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
