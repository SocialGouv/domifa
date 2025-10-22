import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SupervisorListComponent } from "./components/user-supervisor-list/supervisor-list.component";

const routes: Routes = [
  {
    component: SupervisorListComponent,
    path: "",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsersRoutingModule {}
