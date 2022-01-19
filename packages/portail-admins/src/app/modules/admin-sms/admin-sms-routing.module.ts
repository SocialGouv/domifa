import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AdminSmsStatsComponent } from "./components";

const routes: Routes = [{ path: "stats", component: AdminSmsStatsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminSmsRoutingModule {}
