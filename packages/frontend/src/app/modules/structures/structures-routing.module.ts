import { ResponsableGuard } from "../../guards/responsable.guard";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminGuard, AuthGuard, LoggedGuard } from "../../guards";
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
    canActivate: [AuthGuard, ResponsableGuard],
    path: "documents",
    component: StructuresCustomDocsComponent,
  },
  {
    canActivate: [LoggedGuard],
    path: "inscription",
    component: StructuresSearchComponent,
  },
  {
    canActivate: [AuthGuard, AdminGuard],
    path: "sms",
    component: StructuresSmsFormComponent,
  },
  {
    canActivate: [AuthGuard, ResponsableGuard],
    path: "edit",
    component: StructuresEditComponent,
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
