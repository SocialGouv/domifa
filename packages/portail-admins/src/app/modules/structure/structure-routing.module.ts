import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminStructureContainerComponent } from "./components/admin-structure-container/admin-structure-container.component";
import { StructureStatsComponent } from "./components/structure-stats/structure-stats.component";
import { UsersComponent } from "./components/users/users.component";
import { StructureInfoComponent } from "./components/structure-info/structure-info.component";
import { StructureActivityComponent } from "./components/structure-activity/structure-activity.component";
import { StructureSecurityLogsComponent } from "./components/structure-security-logs/structure-security-logs.component";
import { StructureSessionsComponent } from "./components/structure-sessions/structure-sessions.component";

const routes: Routes = [
  {
    path: "",
    component: AdminStructureContainerComponent,
    children: [
      { path: "", component: StructureInfoComponent },
      { path: "users", component: UsersComponent },
      { path: "stats", component: StructureStatsComponent },
      { path: "activity", component: StructureActivityComponent },
      { path: "security-logs", component: StructureSecurityLogsComponent },
      { path: "sessions", component: StructureSessionsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StructureRoutingModule {}
