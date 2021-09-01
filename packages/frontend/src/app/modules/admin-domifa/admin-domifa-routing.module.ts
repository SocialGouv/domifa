import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { DashboardComponent } from "./components/dashboard/dashboard.component";

const adminDomifaRoutes: Routes = [
  {
    path: "",
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(adminDomifaRoutes)],
  exports: [RouterModule],
})
export class AdminDomifaRoutingModule {}
