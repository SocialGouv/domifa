import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StructureComponent } from "./components/structure/structure.component";
import { UsersComponent } from "./components/users/users.component";

const routes: Routes = [
  { path: ":structureId", component: StructureComponent },
  { path: ":structureId/users0", component: UsersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StructureRoutingModule {}
