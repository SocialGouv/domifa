import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SupervisorActivityComponent } from "./components/supervisor-activity/supervisor-activity.component";
import { SupervisorBrevoComponent } from "./components/supervisor-brevo/supervisor-brevo.component";
import { SupervisorDetailContainerComponent } from "./components/supervisor-detail-container/supervisor-detail-container.component";
import { SupervisorInfoComponent } from "./components/supervisor-info/supervisor-info.component";
import { SupervisorSecurityLogsComponent } from "./components/supervisor-security-logs/supervisor-security-logs.component";
import { SupervisorSessionsComponent } from "./components/supervisor-sessions/supervisor-sessions.component";
import { SupervisorListComponent } from "./components/user-supervisor-list/supervisor-list.component";

const routes: Routes = [
  {
    component: SupervisorListComponent,
    path: "",
  },
  {
    component: SupervisorDetailContainerComponent,
    path: ":uuid",
    children: [
      { path: "", component: SupervisorInfoComponent },
      { path: "activity", component: SupervisorActivityComponent },
      { path: "security-logs", component: SupervisorSecurityLogsComponent },
      { path: "brevo", component: SupervisorBrevoComponent },
      { path: "sessions", component: SupervisorSessionsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsersRoutingModule {}
