import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../guards/auth.guard";
import { StuctureStatsComponent } from "./components/structure-stats/structure-stats.component";
import { SUPPORT_READ_ROLES } from "@domifa/common";

export const structureStatsRoutes: Routes = [
  {
    canActivate: [AuthGuard],
    path: "",
    component: StuctureStatsComponent,
    data: {
      roles: SUPPORT_READ_ROLES,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(structureStatsRoutes)],
  exports: [RouterModule],
})
export class StructureStatsRoutingModule {}
