import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../guards/auth-guard";
import { DomifaGuard } from "../../guards/domifa-guard";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

const adminDomifaRoutes: Routes = [
  {
    canActivate: [AuthGuard, DomifaGuard],
    path: "",
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(adminDomifaRoutes)],
  exports: [RouterModule],
})
export class AdminDomifaRoutingModule {}
