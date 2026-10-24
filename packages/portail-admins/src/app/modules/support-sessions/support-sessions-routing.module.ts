import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SupportSessionsListComponent } from "./components/support-sessions-list/support-sessions-list.component";

const routes: Routes = [{ path: "", component: SupportSessionsListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportSessionsRoutingModule {}
