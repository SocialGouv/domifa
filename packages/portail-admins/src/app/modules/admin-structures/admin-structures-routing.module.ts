import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AdminStructuresListComponent } from "./components/admin-structures-list/admin-structures-list.component";
import { StructureConfirmComponent } from "./components/structure-confirm/structure-confirm.component";

const routes: Routes = [
  { path: "", component: AdminStructuresListComponent },
  {
    path: "delete/:structureUuid/:token",
    component: StructureConfirmComponent,
    data: { type: "delete" },
  },
  {
    path: "enable/:structureUuid/:token",
    component: StructureConfirmComponent,
    data: { type: "enable" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresRoutingModule {}
