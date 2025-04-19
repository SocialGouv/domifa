import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AdminStructuresListComponent } from "./components/admin-structures-list/admin-structures-list.component";

const routes: Routes = [{ path: "", component: AdminStructuresListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
