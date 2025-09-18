import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../guards/auth.guard";
import { StuctureStatsComponent } from "./components/structure-stats/structure-stats.component";
import { ALL_USER_STRUCTURE_ROLES } from "@domifa/common";

export const structureStatsRoutes: Routes = [
  {
    canActivate: [AuthGuard],
    path: "",
    component: StuctureStatsComponent,
    data: {
      roles: ALL_USER_STRUCTURE_ROLES,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(structureStatsRoutes)],
  exports: [RouterModule],
})
export class StructureStatsRoutingModule {}
