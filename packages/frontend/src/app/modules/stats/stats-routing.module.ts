import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StatsComponent } from "./components/structure-stats/structure-stats.component";

export const statsRoutes: Routes = [
  { path: "stats/rapport-activite", component: StatsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(statsRoutes)],
  exports: [RouterModule],
})
export class StatsRoutingModule {}
