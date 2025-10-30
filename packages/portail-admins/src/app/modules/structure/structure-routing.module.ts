import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StructureComponent } from "./components/structure/structure.component";
import { UsersComponent } from "./components/users/users.component";
import { AdminStructuresListComponent } from "../admin-structures/components/admin-structures-list/admin-structures-list.component";

const routes: Routes = [
  { path: "", component: AdminStructuresListComponent, pathMatch: "full" },
  { path: ":structureId", component: StructureComponent, pathMatch: "full" },
  { path: ":structureId/users", component: UsersComponent, pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StructureRoutingModule {}
