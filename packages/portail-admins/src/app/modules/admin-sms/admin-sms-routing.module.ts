import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminSmsStatsComponent } from "./components/admin-sms-stats/admin-sms-stats.component";

const routes: Routes = [{ path: "stats", component: AdminSmsStatsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminSmsRoutingModule {}
