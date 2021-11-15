import { StructuresUploadDocsComponent } from "./components/structures-upload-docs/structures-upload-docs.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import {
  AuthGuard,
  AdminGuard,
  CanEditSmsGuard,
  CanEditPortailUsagerGuard,
  LoggedGuard,
  FacteurGuard,
} from "../../guards";
import { StructuresConfirmComponent } from "./components/structures-confirm/structures-confirm.component";
import { StructuresFormComponent } from "./components/structures-form/structures-form.component";
import { StructuresPortailUsagerFormComponent } from "./components/structures-portail-usager-form/structures-portail-usager-form.component";
import { StructuresSearchComponent } from "./components/structures-search/structures-search.component";
import { StructuresSmsFormComponent } from "./components/structures-sms-form/structures-sms-form.component";
import { StructuresEditComponent } from "./components/structures-edit/structures-edit.component";

const routes: Routes = [
  {
    canActivate: [LoggedGuard],
    path: "nouveau",
    component: StructuresFormComponent,
  },
  {
    canActivate: [AuthGuard, AdminGuard],
    path: "documents",
    component: StructuresUploadDocsComponent,
  },
  {
    canActivate: [LoggedGuard],
    path: "inscription",
    component: StructuresSearchComponent,
  },
  {
    canActivate: [AuthGuard, AdminGuard, CanEditSmsGuard],
    path: "sms",
    component: StructuresSmsFormComponent,
  },
  {
    canActivate: [AuthGuard, FacteurGuard],
    path: "edit",
    component: StructuresEditComponent,
  },
  {
    canActivate: [AuthGuard, AdminGuard, CanEditPortailUsagerGuard],
    path: "portail-usager",
    component: StructuresPortailUsagerFormComponent,
  },
  {
    component: StructuresConfirmComponent,
    path: "confirm/:id/:token",
  },
  {
    component: StructuresConfirmComponent,
    path: "delete/:id/:token",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StructuresRoutingModule {}
