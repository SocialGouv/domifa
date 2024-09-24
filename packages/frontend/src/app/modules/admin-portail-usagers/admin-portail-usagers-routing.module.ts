import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PortailUsagersParamsComponent } from "./components/portail-usagers-params/portail-usagers-params.component";
import { ManageStructureInformationComponent } from "./components/manage-structure-information/manage-structure-information.component";

const routes: Routes = [
  {
    path: "",
    component: PortailUsagersParamsComponent,
  },
  {
    path: "informations",
    component: ManageStructureInformationComponent,
  },
  {
    path: ":section",
    component: PortailUsagersParamsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPortailUsagersRoutingModule {}
