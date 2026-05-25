import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SuspiciousActivityListComponent } from "./components/suspicious-activity-list/suspicious-activity-list.component";
import { SuspiciousActivityUserDetailComponent } from "./components/suspicious-activity-user-detail/suspicious-activity-user-detail.component";

const routes: Routes = [
  { path: "", component: SuspiciousActivityListComponent },
  {
    path: "users/:userType/:uuid",
    component: SuspiciousActivityUserDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuspiciousActivityRoutingModule {}
