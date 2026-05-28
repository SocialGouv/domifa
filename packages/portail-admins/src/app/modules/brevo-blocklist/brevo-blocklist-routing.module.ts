import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { BrevoBlocklistComponent } from "./components/brevo-blocklist/brevo-blocklist.component";

const routes: Routes = [{ path: "", component: BrevoBlocklistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrevoBlocklistRoutingModule {}
