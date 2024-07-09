import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PortailUsagersParamsComponent } from "./components/portail-usagers-params/portail-usagers-params.component";

const routes: Routes = [
  {
    path: "",
    component: PortailUsagersParamsComponent,
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
