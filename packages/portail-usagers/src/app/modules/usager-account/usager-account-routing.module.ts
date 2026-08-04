import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeUsagerComponent } from "./components/home-usager/home-usager.component";
import { UsagerAcceptCguComponent } from "./components/usager-accept-cgu/usager-accept-cgu.component";
import { HistoriqueCourriersComponent } from "./components/historique-courriers/historique-courriers.component";
import { UsagerAccountPasswordComponent } from "./components/usager-account-password/usager-account-password.component";

const routes: Routes = [
  { path: "", component: HomeUsagerComponent },
  { path: "historique", component: HistoriqueCourriersComponent },
  {
    path: "accept-terms",
    component: UsagerAcceptCguComponent,
  },
  {
    path: "mon-compte",
    component: UsagerAccountPasswordComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsagerAccountRoutingModule {}
