import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { StructureUsersListComponent } from "./components/structure-users-list/structure-users-list.component";

const routes: Routes = [
  {
    component: StructureUsersListComponent,
    path: "",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageStructureUsersRoutingModule {}
