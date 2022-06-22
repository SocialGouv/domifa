import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminStructuresStatsComponent } from "./components";

import { AdminStructuresDocsComponent } from "./components/admin-structures-docs/admin-structures-docs.component";
import { AdminStructuresListComponent } from "./components/admin-structures-list/admin-structures-list.component";

const routes: Routes = [
  { path: "", component: AdminStructuresListComponent },
  { path: "stats", component: AdminStructuresStatsComponent },
  { path: "custom-docs", component: AdminStructuresDocsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
