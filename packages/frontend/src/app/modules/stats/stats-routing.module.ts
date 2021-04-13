import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../../guards/auth-guard";
import { DomifaGuard } from "../../guards/domifa-guard";
import { FacteurGuard } from "../../guards/facteur-guard";
import { ResponsableGuard } from "../../guards/responsable-guard";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { StatsComponent } from "./components/stats/stats.component";

export const statsRoutes: Routes = [
  { path: "stats/rapport-activite", component: StatsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(statsRoutes)],
  exports: [RouterModule],
})
export class StatsRoutingModule {}
