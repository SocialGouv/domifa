import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard, LoggedGuard } from "../../guards";
import { StructuresCustomDocsComponent } from "./components/structures-custom-docs/structures-custom-docs.component";
import { StructuresEditComponent } from "./components/structures-edit/structures-edit.component";
import { StructuresFormComponent } from "./components/structures-form/structures-form.component";
import { StructuresSearchComponent } from "./components/structures-search/structures-search.component";
import { StructuresSmsFormComponent } from "./components/structures-sms-form/structures-sms-form.component";

const routes: Routes = [
  {
    canActivate: [LoggedGuard],
    path: "nouveau",
    component: StructuresFormComponent,
  },
  {
    canActivate: [AuthGuard],
    path: "documents",
    component: StructuresCustomDocsComponent,
    data: {
      roles: ["admin", "responsable"],
    },
  },
  {
    canActivate: [LoggedGuard],
    path: "inscription",
    component: StructuresSearchComponent,
  },
  {
    canActivate: [AuthGuard],
    path: "sms",
    component: StructuresSmsFormComponent,
    data: {
      roles: ["admin"],
    },
  },
  {
    canActivate: [AuthGuard],
    path: "edit",
    component: StructuresEditComponent,
    data: {
      roles: ["admin", "responsable"],
    },
  },
  {
    path: "portail-usager",
    redirectTo: "/portail-usagers",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StructuresRoutingModule {}
