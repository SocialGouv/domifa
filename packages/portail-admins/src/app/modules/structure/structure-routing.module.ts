import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminStructureContainerComponent } from "./components/admin-structure-container/admin-structure-container.component";
import { structureResolver } from "../admin-structures/resolvers/structure.resolver";
import { StructureStatsComponent } from "./components/structure-stats/structure-stats.component";
import { UsersComponent } from "./components/users/users.component";
import { StructureInfoComponent } from "./components/structure-info/structure-info.component";

const routes: Routes = [
  {
    path: "",
    component: AdminStructureContainerComponent,
    resolve: { structure: structureResolver },
    children: [
      { path: "", component: StructureInfoComponent },
      { path: "users", component: UsersComponent },
      { path: "stats", component: StructureStatsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StructureRoutingModule {}
