import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NationalStatsComponent } from "./components/national-stats/national-stats.component";

const routes: Routes = [
  { path: "rapports", component: NationalStatsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
