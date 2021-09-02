import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../guards/auth-guard";
import { FacteurGuard } from "../../guards/facteur-guard";
import { PublicStatsComponent } from "./components/public-stats/public-stats.component";
import { StatsComponent } from "./components/structure-stats/structure-stats.component";

export const statsRoutes: Routes = [
  {
    path: "",
    component: PublicStatsComponent,
  },
  {
    path: "region/:region",
    component: PublicStatsComponent,
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: "rapport-activite",
    component: StatsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(statsRoutes)],
  exports: [RouterModule],
})
export class StatsRoutingModule {}
