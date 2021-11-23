import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StructuresConfirmComponent } from "./structures-confirm.component";

const routes: Routes = [
  {
    path: "delete/:structureId/:token",
    component: StructuresConfirmComponent,
    data: { type: "delete" },
  },
  {
    path: "enable/:structureId/:token",
    component: StructuresConfirmComponent,
    data: { type: "enable" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminStructuresConfirmRoutingModule {}
