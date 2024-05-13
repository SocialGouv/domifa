import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminStructuresStatsComponent } from "./components";

import { AdminStructuresListComponent } from "./components/admin-structures-list/admin-structures-list.component";
import { NationalStatsComponent } from "./components/national-stats/national-stats.component";

const routes: Routes = [
  { path: "", component: AdminStructuresListComponent },
  { path: "stats", component: AdminStructuresStatsComponent },
  { path: "rapports", component: NationalStatsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
