import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { StructureUserActivityComponent } from "./components/structure-user-activity/structure-user-activity.component";
import { StructureUserBrevoComponent } from "./components/structure-user-brevo/structure-user-brevo.component";
import { StructureUserDetailContainerComponent } from "./components/structure-user-detail-container/structure-user-detail-container.component";
import { StructureUserInfoComponent } from "./components/structure-user-info/structure-user-info.component";
import { StructureUserSessionsComponent } from "./components/structure-user-sessions/structure-user-sessions.component";
import { StructureUsersListComponent } from "./components/structure-users-list/structure-users-list.component";

const routes: Routes = [
  {
    component: StructureUsersListComponent,
    path: "",
  },
  {
    component: StructureUserDetailContainerComponent,
    path: ":uuid",
    children: [
      { path: "", component: StructureUserInfoComponent },
      { path: "activity", component: StructureUserActivityComponent },
      { path: "brevo", component: StructureUserBrevoComponent },
      { path: "sessions", component: StructureUserSessionsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageStructureUsersRoutingModule {}
