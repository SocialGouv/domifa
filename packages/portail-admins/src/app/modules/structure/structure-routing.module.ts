import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StructureComponent } from "./components/structure/structure.component";
import { AdminStructureContainerComponent } from "./components/admin-structure-container/admin-structure-container.component";
import { structureResolver } from "../admin-structures/resolvers/structure.resolver";
import { StructureStatsComponent } from "./components/structure-stats/structure-stats.component";
import { UsersComponent } from "./components/users/users.component";

const routes: Routes = [
  {
    path: "",
    component: AdminStructureContainerComponent,
    resolve: {
      structure: structureResolver,
    },
    children: [
      {
        path: "",
        component: StructureComponent,
      },
      {
        path: "users",
        component: UsersComponent,
      },
      {
        path: "stats",
        component: StructureStatsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StructureRoutingModule {}
