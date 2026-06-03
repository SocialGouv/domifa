import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SessionsStatsPageComponent } from "./components/sessions-stats-page/sessions-stats-page.component";

const routes: Routes = [{ path: "", component: SessionsStatsPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionsStatsRoutingModule {}
