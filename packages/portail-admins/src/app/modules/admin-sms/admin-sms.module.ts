import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxChartsModule } from "@swimlane/ngx-charts";

import { AdminSmsRoutingModule } from "./admin-sms-routing.module";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { AdminSmsStatsComponent } from "./components/admin-sms-stats/admin-sms-stats.component";

@NgModule({
  declarations: [AdminSmsStatsComponent],
  imports: [CommonModule, SharedModule, NgxChartsModule, AdminSmsRoutingModule],
})
export class AdminSmsModule {}
