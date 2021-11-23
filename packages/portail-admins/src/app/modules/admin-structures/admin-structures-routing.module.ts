import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {
  AdminStructuresListComponent,
  AdminStructuresStatsComponent,
} from "./components";

const routes: Routes = [
  { path: "", component: AdminStructuresListComponent },
  { path: "stats", component: AdminStructuresStatsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
