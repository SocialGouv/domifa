import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ImpactComponent } from "./components/impact/impact.component";
import { PublicStatsComponent } from "./components/public-stats/public-stats.component";

export const statsRoutes: Routes = [
  {
    path: "",
    component: PublicStatsComponent,
  },
  {
    path: "impact",
    component: ImpactComponent,
  },
  {
    path: "region/:region",
    component: PublicStatsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(statsRoutes)],
  exports: [RouterModule],
})
export class StatsRoutingModule {}
