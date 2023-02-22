import { ManageUsagersPageComponent } from "./components/manage-usagers-page/manage-usagers-page.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../../guards";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    path: "",
    component: ManageUsagersPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsagersRoutingModule {}
