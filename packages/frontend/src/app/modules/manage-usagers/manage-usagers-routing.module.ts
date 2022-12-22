import { ManageUsagersComponent } from "./components/manage/manage.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../../guards";

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    path: "",
    component: ManageUsagersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageUsagersRoutingModule {}
