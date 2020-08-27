import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";

import { RapportComponent } from "./components/rapport/rapport.component";
import { StatsComponent } from "./components/stats/stats.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

export const statsRoutes: Routes = [
  {
    path: "rapport",
    component: RapportComponent,
  },
  {
    path: "domifa",
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(statsRoutes)],
  exports: [RouterModule],
})
export class StatsRoutingModule {}
