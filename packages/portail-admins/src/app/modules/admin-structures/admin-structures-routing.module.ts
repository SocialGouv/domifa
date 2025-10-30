import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../guards/auth-guard";
import { AdminStructureContainerComponent } from "./admin-structure-container/admin-structure-container.component";

const routes: Routes = [
  {
    path: "",
    component: AdminStructureContainerComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ["super-admin-domifa"],
    },
    loadChildren: () =>
      import("../structure/structure.module").then((m) => m.StructureModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
